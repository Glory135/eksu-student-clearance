import { getPayload } from 'payload';
import config from '../payload.config';

async function seed() {
  const payload = await getPayload({ config });

  try {
    console.log('🌱 Starting database seed...');

    // Create departments
    const departments = [
      {
        name: 'Computer Science',
        code: 'CS',
        description: 'Department of Computer Science',
        status: 'active',
        clearanceOrder: 1,
      },
      {
        name: 'Mathematics',
        code: 'MAT',
        description: 'Department of Mathematics',
        status: 'active',
        clearanceOrder: 2,
      },
      {
        name: 'Physics',
        code: 'PHY',
        description: 'Department of Physics',
        status: 'active',
        clearanceOrder: 3,
      },
      {
        name: 'Chemistry',
        code: 'CHEM',
        description: 'Department of Chemistry',
        status: 'active',
        clearanceOrder: 4,
      },
      {
        name: 'Library',
        code: 'LIB',
        description: 'University Library',
        status: 'active',
        clearanceOrder: 5,
      },
      {
        name: 'Bursary',
        code: 'BUR',
        description: 'Bursary Department',
        status: 'active',
        clearanceOrder: 6,
      },
      {
        name: 'Student Affairs',
        code: 'SA',
        description: 'Student Affairs Office',
        status: 'active',
        clearanceOrder: 7,
      },
      {
        name: 'Registry',
        code: 'REG',
        description: 'Registry Department',
        status: 'active',
        clearanceOrder: 8,
      },
    ];

    console.log('📚 Creating departments...');
    const createdDepartments = [];
    for (const dept of departments) {
      const existing = await payload.find({
        collection: 'departments',
        where: { code: { equals: dept.code } },
      });
      
      if (existing.docs.length === 0) {
        const created = await payload.create({
          collection: 'departments',
          data: dept,
        });
        createdDepartments.push(created);
        console.log(`✅ Created department: ${dept.name}`);
      } else {
        createdDepartments.push(existing.docs[0]);
        console.log(`⏭️  Department already exists: ${dept.name}`);
      }
    }

    // Create requirements for each department
    const requirements = [
      // Computer Science requirements
      {
        name: 'Academic Transcript',
        code: 'TRANSCRIPT',
        description: 'Official academic transcript showing all courses and grades',
        department: createdDepartments.find(d => d.code === 'CS')?.id,
        documentType: 'transcript',
        isRequired: true,
        fileTypes: ['pdf'],
        maxFileSize: 5,
        order: 1,
      },
      {
        name: 'Project Report',
        code: 'PROJECT_REPORT',
        description: 'Final year project report',
        department: createdDepartments.find(d => d.code === 'CS')?.id,
        documentType: 'project-report',
        isRequired: true,
        fileTypes: ['pdf', 'docx'],
        maxFileSize: 10,
        order: 2,
      },
      {
        name: 'Payment Receipt',
        code: 'PAYMENT_RECEIPT',
        description: 'Receipt for all outstanding fees',
        department: createdDepartments.find(d => d.code === 'BUR')?.id,
        documentType: 'payment-receipt',
        isRequired: true,
        fileTypes: ['pdf', 'jpg', 'png'],
        maxFileSize: 5,
        order: 1,
      },
      {
        name: 'Library Clearance',
        code: 'LIBRARY_CLEARANCE',
        description: 'Library clearance certificate',
        department: createdDepartments.find(d => d.code === 'LIB')?.id,
        documentType: 'library-clearance',
        isRequired: true,
        fileTypes: ['pdf', 'jpg', 'png'],
        maxFileSize: 5,
        order: 1,
      },
      {
        name: 'Student ID Card',
        code: 'STUDENT_ID',
        description: 'Current student ID card',
        department: createdDepartments.find(d => d.code === 'REG')?.id,
        documentType: 'student-id',
        isRequired: true,
        fileTypes: ['jpg', 'png', 'pdf'],
        maxFileSize: 5,
        order: 1,
      },
      {
        name: 'Medical Certificate',
        code: 'MEDICAL_CERT',
        description: 'Medical fitness certificate',
        department: createdDepartments.find(d => d.code === 'SA')?.id,
        documentType: 'medical-certificate',
        isRequired: true,
        fileTypes: ['pdf', 'jpg', 'png'],
        maxFileSize: 5,
        order: 1,
      },
    ];

    console.log('📋 Creating requirements...');
    for (const req of requirements) {
      if (req.department) {
        const existing = await payload.find({
          collection: 'requirements',
          where: { 
            code: { equals: req.code },
            department: { equals: req.department }
          },
        });
        
        if (existing.docs.length === 0) {
          await payload.create({
            collection: 'requirements',
            data: req,
          });
          console.log(`✅ Created requirement: ${req.name}`);
        } else {
          console.log(`⏭️  Requirement already exists: ${req.name}`);
        }
      }
    }

    // Create admin user
    console.log('👤 Creating admin user...');
    const adminEmail = 'admin@eksu.edu.ng';
    const existingAdmin = await payload.find({
      collection: 'users',
      where: { email: { equals: adminEmail } },
    });

    if (existingAdmin.docs.length === 0) {
      await payload.create({
        collection: 'users',
        data: {
          name: 'System Administrator',
          email: adminEmail,
          role: 'admin',
          status: 'active',
        },
      });
      console.log('✅ Created admin user');
    } else {
      console.log('⏭️  Admin user already exists');
    }

    // Create sample officers
    const officers = [
      {
        name: 'Dr. Sarah Johnson',
        email: 's.johnson@eksu.edu.ng',
        role: 'officer',
        department: createdDepartments.find(d => d.code === 'CS')?.id,
        status: 'active',
      },
      {
        name: 'Prof. Michael Brown',
        email: 'm.brown@eksu.edu.ng',
        role: 'officer',
        department: createdDepartments.find(d => d.code === 'MAT')?.id,
        status: 'active',
      },
      {
        name: 'Dr. Emily Davis',
        email: 'e.davis@eksu.edu.ng',
        role: 'student-affairs',
        department: createdDepartments.find(d => d.code === 'SA')?.id,
        status: 'active',
      },
    ];

    console.log('👨‍💼 Creating sample officers...');
    for (const officer of officers) {
      const existing = await payload.find({
        collection: 'users',
        where: { email: { equals: officer.email } },
      });
      
      if (existing.docs.length === 0) {
        await payload.create({
          collection: 'users',
          data: officer,
        });
        console.log(`✅ Created officer: ${officer.name}`);
      } else {
        console.log(`⏭️  Officer already exists: ${officer.name}`);
      }
    }

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Run the development server: npm run dev');
    console.log('2. Access Payload admin: http://localhost:3000/admin');
    console.log('3. Login with admin@eksu.edu.ng');
    console.log('4. Set password for admin and officer accounts');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

seed(); 