interface SeedCard {
  front: string
  back: string
  example: string
  exampleTranslation: string
  note: string
}

export const starterDeck = {
  title: 'Русский — первые слова',
  frontLang: 'Русский',
  backLang: 'English',
  voice: 'ru-RU',
  accent: '#D8402F'
}

export const starterCards: SeedCard[] = [
  { front: 'привет', back: 'hello', example: 'Привет, как дела?', exampleTranslation: 'Hi, how are you?', note: 'informal greeting' },
  { front: 'спасибо', back: 'thank you', example: 'Спасибо за помощь.', exampleTranslation: 'Thanks for the help.', note: '' },
  { front: 'пожалуйста', back: 'please / you are welcome', example: 'Пожалуйста, садитесь.', exampleTranslation: 'Please, sit down.', note: 'both meanings' },
  { front: 'да', back: 'yes', example: 'Да, конечно.', exampleTranslation: 'Yes, of course.', note: '' },
  { front: 'нет', back: 'no', example: 'Нет, спасибо.', exampleTranslation: 'No, thank you.', note: '' },
  { front: 'вода', back: 'water', example: 'Дайте, пожалуйста, воды.', exampleTranslation: 'Some water, please.', note: 'feminine noun' },
  { front: 'хлеб', back: 'bread', example: 'Я купил свежий хлеб.', exampleTranslation: 'I bought fresh bread.', note: 'masculine noun' },
  { front: 'друг', back: 'friend', example: 'Он мой старый друг.', exampleTranslation: 'He is my old friend.', note: 'masculine; feminine is подруга' },
  { front: 'дом', back: 'house / home', example: 'Я иду домой.', exampleTranslation: 'I am going home.', note: '' },
  { front: 'книга', back: 'book', example: 'Это интересная книга.', exampleTranslation: 'This is an interesting book.', note: 'feminine noun' },
  { front: 'время', back: 'time', example: 'У меня нет времени.', exampleTranslation: 'I have no time.', note: 'neuter noun' },
  { front: 'город', back: 'city', example: 'Москва — большой город.', exampleTranslation: 'Moscow is a big city.', note: '' },
  { front: 'работа', back: 'work / job', example: 'Мне нравится моя работа.', exampleTranslation: 'I like my job.', note: '' },
  { front: 'сегодня', back: 'today', example: 'Сегодня хорошая погода.', exampleTranslation: 'The weather is nice today.', note: '' },
  { front: 'завтра', back: 'tomorrow', example: 'Увидимся завтра.', exampleTranslation: 'See you tomorrow.', note: '' },
  { front: 'хорошо', back: 'good / well', example: 'Всё хорошо.', exampleTranslation: 'Everything is fine.', note: '' },
  { front: 'любить', back: 'to love', example: 'Я люблю читать.', exampleTranslation: 'I love to read.', note: 'verb, imperfective' },
  { front: 'говорить', back: 'to speak / to say', example: 'Вы говорите по-русски?', exampleTranslation: 'Do you speak Russian?', note: 'verb, imperfective' },
  { front: 'знать', back: 'to know', example: 'Я не знаю ответа.', exampleTranslation: 'I do not know the answer.', note: 'verb' },
  { front: 'учить', back: 'to learn / to study', example: 'Я учу русский язык.', exampleTranslation: 'I am learning Russian.', note: 'verb' },
  { front: 'язык', back: 'language / tongue', example: 'Русский язык — красивый.', exampleTranslation: 'Russian is a beautiful language.', note: 'masculine noun' },
  { front: 'человек', back: 'person / human', example: 'Он хороший человек.', exampleTranslation: 'He is a good person.', note: 'plural is люди' }
]
