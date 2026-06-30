const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar dados
  await prisma.documentItem.deleteMany();
  await prisma.document.deleteMany();
  await prisma.materialVariant.deleteMany();
  await prisma.material.deleteMany();
  await prisma.category.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();

  console.log('✅ Dados limpos');

  // Empresa
  const empresa = await prisma.company.create({
    data: { name: 'Acme Engineering', cnpj: '12.345.678/0001-99' },
  });

  // Usuários
  const senhaHash = await bcrypt.hash('senha123', 10);
  
  const admin = await prisma.user.create({
    data: { name: 'Admin Sistema', email: 'admin@acme.com', passwordHash: senhaHash, role: 'admin', companyId: empresa.id },
  });

  const gestor = await prisma.user.create({
    data: { name: 'João Gestor', email: 'gestor@acme.com', passwordHash: senhaHash, role: 'gestor', companyId: empresa.id },
  });

  const engenheiro = await prisma.user.create({
    data: { name: 'Maria Engenheira', email: 'engenheiro@acme.com', passwordHash: senhaHash, role: 'engenheiro', companyId: empresa.id },
  });

  const usuario = await prisma.user.create({
    data: { name: 'Carlos Usuário', email: 'usuario@acme.com', passwordHash: senhaHash, role: 'usuario', companyId: empresa.id },
  });

  const cliente = await prisma.user.create({
    data: { name: 'Ana Cliente', email: 'cliente@externa.com', passwordHash: senhaHash, role: 'cliente', companyId: empresa.id },
  });

  console.log('✅ Usuários criados (5)');

  // Categorias
  const catEletrico = await prisma.category.create({
    data: { namePt: 'Elétrico', nameEn: 'Electrical', nameEs: 'Eléctrico' },
  });

  const catTubulacao = await prisma.category.create({
    data: { namePt: 'Tubulação', nameEn: 'Piping', nameEs: 'Tubería' },
  });

  const catInstrumentacao = await prisma.category.create({
    data: { namePt: 'Instrumentação', nameEn: 'Instrumentation', nameEs: 'Instrumentación' },
  });

  console.log('✅ Categorias criadas (3)');

  // Material: Cabo de Cobre
  const materialCabo = await prisma.material.create({
    data: {
      code: '10.1001',
      namePt: 'Cabo de Cobre',
      nameEn: 'Copper Cable',
      nameEs: 'Cable de Cobre',
      descriptionPt: 'Cabo elétrico de cobre para instalações industriais',
      descriptionEn: 'Copper electrical cable for industrial installations',
      descriptionEs: 'Cable eléctrico de cobre para instalaciones industriales',
      categoryId: catEletrico.id,
      createdById: gestor.id,
    },
  });

  await prisma.materialVariant.create({
    data: { code: '10.1001.01', namePt: '2,5 mm²', nameEn: '2.5 mm²', nameEs: '2,5 mm²', materialId: materialCabo.id },
  });

  await prisma.materialVariant.create({
    data: { code: '10.1001.02', namePt: '4,0 mm²', nameEn: '4.0 mm²', nameEs: '4,0 mm²', materialId: materialCabo.id },
  });

  await prisma.materialVariant.create({
    data: { code: '10.1001.03', namePt: '6,0 mm²', nameEn: '6.0 mm²', nameEs: '6,0 mm²', materialId: materialCabo.id },
  });

  // Material: Tubo de Aço
  const materialTubo = await prisma.material.create({
    data: {
      code: '20.2001',
      namePt: 'Tubo de Aço Carbono',
      nameEn: 'Carbon Steel Pipe',
      nameEs: 'Tubo de Acero al Carbono',
      descriptionPt: 'Tubo de aço carbono sem costura SCH 40',
      descriptionEn: 'Carbon steel seamless pipe SCH 40',
      descriptionEs: 'Tubo de acero al carbono sin costura SCH 40',
      categoryId: catTubulacao.id,
      createdById: gestor.id,
    },
  });

  await prisma.materialVariant.create({
    data: { code: '20.2001.01', namePt: '1/2"', nameEn: '1/2"', nameEs: '1/2"', materialId: materialTubo.id },
  });

  await prisma.materialVariant.create({
    data: { code: '20.2001.02', namePt: '3/4"', nameEn: '3/4"', nameEs: '3/4"', materialId: materialTubo.id },
  });

  await prisma.materialVariant.create({
    data: { code: '20.2001.03', namePt: '1"', nameEn: '1"', nameEs: '1"', materialId: materialTubo.id },
  });

  // Material: Válvula Esfera
  const materialValvula = await prisma.material.create({
    data: {
      code: '30.3001',
      namePt: 'Válvula Esfera',
      nameEn: 'Ball Valve',
      nameEs: 'Válvula de Bola',
      descriptionPt: 'Válvula esfera em aço inox 316',
      descriptionEn: 'Ball valve in stainless steel 316',
      descriptionEs: 'Válvula de bola en acero inoxidable 316',
      categoryId: catInstrumentacao.id,
      createdById: gestor.id,
    },
  });

  await prisma.materialVariant.create({
    data: { code: '30.3001.01', namePt: '1/2" - 150#', nameEn: '1/2" - 150#', nameEs: '1/2" - 150#', materialId: materialValvula.id },
  });

  await prisma.materialVariant.create({
    data: { code: '30.3001.02', namePt: '1" - 150#', nameEn: '1" - 150#', nameEs: '1" - 150#', materialId: materialValvula.id },
  });

  console.log('✅ Materiais e Variantes criados (3 materiais, 8 variantes)');

  // Projetos
  const projeto1 = await prisma.project.create({
    data: {
      code: 'PROJ-2024-001',
      name: 'Planta Industrial São Paulo',
      description: 'Projeto de expansão da planta industrial',
      status: 'ativo',
      companyId: empresa.id,
      createdById: engenheiro.id,
    },
  });

  const projeto2 = await prisma.project.create({
    data: {
      code: 'PROJ-2024-002',
      name: 'Modernização Refinaria RJ',
      description: 'Modernização de sistemas elétricos e instrumentação',
      status: 'revisao',
      companyId: empresa.id,
      createdById: engenheiro.id,
    },
  });

  const projeto3 = await prisma.project.create({
    data: {
      code: 'PROJ-2024-003',
      name: 'Terminal Portuário Santos',
      description: 'Novo terminal de cargas',
      status: 'encerrado',
      companyId: empresa.id,
      createdById: usuario.id,
    },
  });

  console.log('✅ Projetos criados (3)');

  // Documentos e Itens
  const varCabo = await prisma.materialVariant.findFirst({ where: { code: '10.1001.01' } });
  const varTubo = await prisma.materialVariant.findFirst({ where: { code: '20.2001.03' } });
  const varValvula = await prisma.materialVariant.findFirst({ where: { code: '30.3001.02' } });

  if (varCabo && varTubo && varValvula) {
    const doc1 = await prisma.document.create({
      data: {
        code: 'LM-001',
        title: 'Lista de Materiais Elétricos',
        type: 'lista_materiais',
        revision: 'R0',
        projectId: projeto1.id,
        createdById: engenheiro.id,
      },
    });

    await prisma.documentItem.create({
      data: { quantity: 150.5, variantId: varCabo.id, documentId: doc1.id, lineNumber: 1 },
    });

    await prisma.documentItem.create({
      data: { quantity: 25, variantId: varTubo.id, documentId: doc1.id, lineNumber: 2 },
    });

    await prisma.documentItem.create({
      data: { quantity: 8, variantId: varValvula.id, documentId: doc1.id, lineNumber: 3 },
    });

    const doc2 = await prisma.document.create({
      data: {
        code: 'EST-001',
        title: 'Estimativa de Materiais',
        type: 'lista_estimativa',
        revision: 'R0',
        projectId: projeto1.id,
        createdById: engenheiro.id,
      },
    });

    await prisma.documentItem.create({
      data: { quantity: 200, variantId: varCabo.id, documentId: doc2.id, lineNumber: 1 },
    });

    await prisma.documentItem.create({
      data: { quantity: 30, variantId: varTubo.id, documentId: doc2.id, lineNumber: 2 },
    });

    console.log('✅ Documentos e Itens criados (2 documentos)');
  }

  console.log('');
  console.log('🎉 Seed completo!');
  console.log('');
  console.log('👥 Credenciais de acesso:');
  console.log('   • admin@acme.com (Administrador)');
  console.log('   • gestor@acme.com (Gestor)');
  console.log('   • engenheiro@acme.com (Engenheiro)');
  console.log('   • usuario@acme.com (Usuário)');
  console.log('   • cliente@externa.com (Cliente)');
  console.log('');
  console.log('🔑 Senha para todos: senha123');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
