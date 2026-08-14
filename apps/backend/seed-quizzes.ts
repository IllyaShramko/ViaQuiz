import { PRISMA_CLIENT as prisma } from './src/config/database';

async function main() {
  // Find first user to be the author
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: {
        login: 'testuser',
        email: 'test@example.com',
        password: 'dummy'
      }
    });
  }

  console.log('Using author:', user.login);

  const images = [
    'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?q=80&w=800&auto=format&fit=crop',
  ];

  for (let i = 1; i <= 3; i++) {
    const quiz = await prisma.quiz.create({
      data: {
        name: `Test Quiz ${i}`,
        description: `This is an automatically generated test quiz number ${i} to test the layout and rendering.`,
        coverImg: images[i - 1],
        isDraft: false,
        authorId: user.id,
        keywords: {
          create: [{ name: 'Test' }, { name: `Topic ${i}` }]
        },
        questions: {
          create: [
            {
              text: `What is the correct answer for question 1 in quiz ${i}?`,
              type: 'ONE_ANSWER',
              variants: {
                create: [
                  { text: 'Correct Answer', isCorrect: true, type: 'TEXT' },
                  { text: 'Wrong Answer 1', isCorrect: false, type: 'TEXT' },
                  { text: 'Wrong Answer 2', isCorrect: false, type: 'TEXT' },
                  { text: 'Wrong Answer 3', isCorrect: false, type: 'TEXT' },
                ]
              }
            },
            {
              text: `Which of the following are correct options for question 2?`,
              type: 'MANY_ANSWERS',
              variants: {
                create: [
                  { text: 'Valid Option A', isCorrect: true, type: 'TEXT' },
                  { text: 'Invalid Option B', isCorrect: false, type: 'TEXT' },
                  { text: 'Valid Option C', isCorrect: true, type: 'TEXT' },
                  { text: 'Invalid Option D', isCorrect: false, type: 'TEXT' },
                ]
              }
            }
          ]
        }
      }
    });
    console.log(`Created quiz: ${quiz.name}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
