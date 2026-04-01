const { User, ExcelFile, Session, Chunk, sequelize } = require('../database/models');
require('dotenv').config();

async function main() {
  try {
    // Ensure connection is established
    await sequelize.authenticate();
    console.log('Database connection established for seeding.');

    // Clear existing data (optional, but ensures clean seed)
    await Chunk.destroy({ where: {} });
    await Session.destroy({ where: {} });
    await ExcelFile.destroy({ where: {} });
    await User.destroy({ where: {} });
    console.log('Existing data cleared.');

    // Create users
    const users = await User.bulkCreate([
      { email: 'alice@example.com' },
      { email: 'bob@example.com' },
      { email: 'charlie@example.com' }
    ]);
    console.log(`Created ${users.length} users.`);

    // Create excel files
    const excelFiles = await ExcelFile.bulkCreate([
      {
        user_id: users[0].id,
        file_name: 'financial_report_q1.xlsx',
        s3_key: 'uploads/alice/financial_report_q1.xlsx',
        status: 'completed',
        chunk_count: 5,
        metadata: { department: 'Finance', year: 2024 }
      },
      {
        user_id: users[1].id,
        file_name: 'project_plan.xlsx',
        s3_key: 'uploads/bob/project_plan.xlsx',
        status: 'completed',
        chunk_count: 3,
        metadata: { department: 'Engineering', sprint: 'Q2' }
      },
      {
        user_id: users[2].id,
        file_name: 'inventory_list.xlsx',
        s3_key: 'uploads/charlie/inventory_list.xlsx',
        status: 'processing',
        chunk_count: 0,
        metadata: { department: 'Operations' }
      }
    ]);
    console.log(`Created ${excelFiles.length} excel files.`);

    // Create sessions
    const sessions = await Session.bulkCreate([
      {
        user_id: users[0].id,
        excel_file_id: excelFiles[0].id,
        session_data: { currentStep: 'review', notes: 'Initial review completed' },
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
      },
      {
        user_id: users[1].id,
        excel_file_id: excelFiles[1].id,
        session_data: { currentStep: 'editing', notes: 'Updating timeline' },
        expires_at: new Date(Date.now() + 12 * 60 * 60 * 1000) // 12 hours from now
      },
      {
        user_id: users[2].id,
        excel_file_id: excelFiles[2].id,
        session_data: { currentStep: 'upload', notes: 'File uploaded, awaiting processing' },
        expires_at: new Date(Date.now() + 6 * 60 * 60 * 1000) // 6 hours from now
      }
    ]);
    console.log(`Created ${sessions.length} sessions.`);

    // Create chunks for the first excel file (at least 3 records)
    const chunks = await Chunk.bulkCreate([
      {
        excel_file_id: excelFiles[0].id,
        chunk_index: 0,
        content: 'Revenue for Q1 2024 showed a 12% increase compared to the previous quarter.',
        token_count: 18,
        embedding: null
      },
      {
        excel_file_id: excelFiles[0].id,
        chunk_index: 1,
        content: 'Expenses remained stable, with a slight increase in marketing spend.',
        token_count: 14,
        embedding: null
      },
      {
        excel_file_id: excelFiles[0].id,
        chunk_index: 2,
        content: 'Net profit reached $1.2M, exceeding the target by 8%.',
        token_count: 12,
        embedding: null
      }
    ]);
    console.log(`Created ${chunks.length} chunks.`);

    console.log('Seeding completed successfully.');
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('Database connection closed.');
  }
}

main();