const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar dados existentes (em ordem reversa de dependências)
  // await prisma.auditLog.deleteMany(); // Mantemos os logs de auditoria
  await prisma.documentItem.deleteMany();
  await prisma.document.deleteMany();
  await prisma.materialVariant.deleteMany();
  await prisma.material.deleteMany();
  await prisma.category.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();

  console.log('✅ Dados antigos limpos');

  // Criar empresa
  const empresa = await prisma.company.create({
    data: {
      name: 'Acme Engineering',
      cnpj: '12.345.678/0001-99',
    },
  });
  console.log('✅ Empresa criada:', empresa.name);

  // Criar usuários com diferentes níveis de acesso
  const senhaHash = await bcrypt.hash('senha123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin Sistema',
      email: 'admin@acme.com',
      passwordHash: senhaHash,
      role: 'admin',
      companyId: empresa.id,
    },
  });

  const gestor = await prisma.user.create({
    data: {
      name: 'João Gestor',
      email: 'gestor@acme.com',
      passwordHash: senhaHash,
      role: 'gestor',
      companyId: empresa.id,
    },
  });

  const engenheiro = await prisma.user.create({
    data: {
      name: 'Maria Engenheira',
      email: 'engenheiro@acme.com',
      passwordHash: senhaHash,
      role: 'engenheiro',
      companyId: empresa.id,
    },
  });

  const usuario = await prisma.user.create({
    data: {
      name: 'Carlos Usuário',
      email: 'usuario@acme.com',
      passwordHash: senhaHash,
      role: 'usuario',
      companyId: empresa.id,
    },
  });

  const cliente = await prisma.user.create({
    data: {
      name: 'Ana Cliente',
      email: 'cliente@externa.com',
      passwordHash: senhaHash,
      role: 'cliente',
      companyId: empresa.id,
    },
  });

  console.log('✅ Usuários criados (5)');

  // Criar categorias de materiais
  const categorias = await Promise.all([
    prisma.category.create({
      data: {
        namePt: 'Elétrico',
        nameEn: 'Electrical',
        nameEs: 'Eléctrico',
      },
    }),
    prisma.category.create({
      data: {
        namePt: 'Tubulação',
        nameEn: 'Piping',
        nameEs: 'Tubería',
      },
    }),
    prisma.category.create({
      data: {
        namePt: 'Instrumentação',
        nameEn: 'Instrumentation',
        nameEs: 'Instrumentación',
      },
    }),
    prisma.category.create({
      data: {
        namePt: 'Estrutural',
        nameEn: 'Structural',
        nameEs: 'Estructural',
      },
    }),
  ]);
  console.log('✅ Categorias criadas (4)');

  // Criar materiais (Pai) com variantes (Filho)
  const materialCabo = await prisma.material.create({
    data: {
      code: '10.1001',
      namePt: 'Cabo de Cobre',
      nameEn: 'Copper Cable',
      nameEs: 'Cable de Cobre',
      descriptionPt: 'Cabo elétrico de cobre para instalações industriais',
      descriptionEn: 'Copper electrical cable for industrial installations',
      descriptionEs: 'Cable eléctrico de cobre para instalaciones industriales',
      categoryId: categorias[0].id, // Elétrico
    },
  });

  await Promise.all([
    prisma.materialVariant.create({
      data: {
        code: '10.1001.01',
        namePt: '2,5 mm²',
        nameEn: '2.5 mm²',
        nameEs: '2,5 mm²',
        unit: 'm',
        materialId: materialCabo.id,
      },
    }),
    prisma.materialVariant.create({
      data: {
        code: '10.1001.02',
        namePt: '4,0 mm²',
        nameEn: '4.0 mm²',
        nameEs: '4,0 mm²',
        unit: 'm',
        materialId: materialCabo.id,
      },
    }),
    prisma.materialVariant.create({
      data: {
        code: '10.1001.03',
        namePt: '6,0 mm²',
        nameEn: '6.0 mm²',
        nameEs: '6,0 mm²',
        unit: 'm',
        materialId: materialCabo.id,
      },
    }),
  ]);

  const materialTubo = await prisma.material.create({
    data: {
      code: '20.2001',
      namePt: 'Tubo de Aço Carbono',
      nameEn: 'Carbon Steel Pipe',
      nameEs: 'Tubo de Acero al Carbono',
      descriptionPt: 'Tubo de aço carbono sem costura SCH 40',
      descriptionEn: 'Carbon steel seamless pipe SCH 40',
      descriptionEs: 'Tubo de acero al carbono sin costura SCH 40',
      categoryId: categorias[1].id, // Tubulação
    },
  });

  await Promise.all([
    prisma.materialVariant.create({
      data: {
        code: '20.2001.01',
        namePt: '1/2"',
        nameEn: '1/2"',
        nameEs: '1/2"',
        unit: 'm',
        materialId: materialTubo.id,
      },
    }),
    prisma.materialVariant.create({
      data: {
        code: '20.2001.02',
        namePt: '3/4"',
        nameEn: '3/4"',
        nameEs: '3/4"',
        unit: 'm',
        materialId: materialTubo.id,
      },
    }),
    prisma.materialVariant.create({
      data: {
        code: '20.2001.03',
        namePt: '1"',
        nameEn: '1"',
        nameEs: '1"',
        unit: 'm',
        materialId: materialTubo.id,
      },
    }),
    prisma.materialVariant.create({
      data: {
        code: '20.2001.04',
        namePt: '2"',
        nameEn: '2"',
        nameEs: '2"',
        unit: 'm',
        materialId: materialTubo.id,
      },
    }),
  ]);

  const materialValvula = await prisma.material.create({
    data: {
      code: '30.3001',
      namePt: 'Válvula Esfera',
      nameEn: 'Ball Valve',
      nameEs: 'Válvula de Bola',
      descriptionPt: 'Válvula esfera em aço inox 316',
      descriptionEn: 'Ball valve in stainless steel 316',
      descriptionEs: 'Válvula de bola en acero inoxidable 316',
      categoryId: categorias[2].id, // Instrumentação
    },
  });

  await Promise.all([
    prisma.materialVariant.create({
      data: {
        code: '30.3001.01',
        namePt: '1/2" - 150#',
        nameEn: '1/2" - 150#',
        nameEs: '1/2" - 150#',
        unit: 'un',
        materialId: materialValvula.id,
      },
    }),
    prisma.materialVariant.create({
      data: {
        code: '30.3001.02',
        namePt: '1" - 150#',
        nameEn: '1" - 150#',
        nameEs: '1" - 150#',
        unit: 'un',
        materialId: materialValvula.id,
      },
    }),
  ]);

  console.log('✅ Materiais e Variantes criados (3 materiais, 9 variantes)');

  // Criar projetos
  const projeto1 = await prisma.project.create({
    data: {
      code: 'PROJ-2024-001',
      name: 'Planta Industrial São Paulo',
      description: 'Projeto de expansão da planta industrial',
      companyId: empresa.id,
      createdById: engenheiro.id,
    },
  });

  const projeto2 = await prisma.project.create({
    data: {
      code: 'PROJ-2024-002',
      name: 'Modernização Refinaria RJ',
      description: 'Modernização de sistemas elétricos e instrumentação',
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

  // Criar documentos com itens
  const varianteCabo25 = await prisma.materialVariant.findFirst({
    where: { code: '10.1001.01' },
  });
  const varianteTubo1 = await prisma.materialVariant.findFirst({
    where: { code: '20.2001.03' },
  });
  const varianteValvula = await prisma.materialVariant.findFirst({
    where: { code: '30.3001.02' },
  });

  if (varianteCabo25 && varianteTubo1 && varianteValvula) {
    const doc1 = await prisma.document.create({
      data: {
        code: 'LM-001-R0',
        title: 'Lista de Materiais Elétricos',
        type: 'lista_materiais',
        projectId: projeto1.id,
        createdById: engenheiro.id,
      },
    });

    await Promise.all([
      prisma.documentItem.create({
        data: {
          quantity: 150.5,
          unit: 'm',
          variantId: varianteCabo25.id,
          documentId: doc1.id,
        },
      }),
      prisma.documentItem.create({
        data: {
          quantity: 25,
          unit: 'm',
          variantId: varianteTubo1.id,
          documentId: doc1.id,
        },
      }),
      prisma.documentItem.create({
        data: {
          quantity: 8,
          unit: 'un',
          variantId: varianteValvula.id,
          documentId: doc1.id,
        },
      }),
    ]);

    const doc2 = await prisma.document.create({
      data: {
        code: 'EST-001-R0',
        title: 'Estimativa de Materiais',
        type: 'estimativa',
        projectId: projeto1.id,
        createdById: engenheiro.id,
      },
    });

    await Promise.all([
      prisma.documentItem.create({
        data: {
          quantity: 200,
          unit: 'm',
          variantId: varianteCabo25.id,
          documentId: doc2.id,
        },
      }),
      prisma.documentItem.create({
        data: {
          quantity: 30,
          unit: 'm',
          variantId: varianteTubo1.id,
          documentId: doc2.id,
        },
      }),
    ]);

    console.log('✅ Documentos e Itens criados (2 documentos)');
  }

  console.log('');
  console.log('🎉 Seed completo!');
  console.log('');
  console.log('👥 Usuários criados:');
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
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
