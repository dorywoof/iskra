interface SeedCard {
  front: string
  back: string
  example: string
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
  { front: 'привет', back: 'hello', example: 'Привет, как дела?', note: 'informal greeting' },
  { front: 'спасибо', back: 'thank you', example: 'Спасибо за помощь.', note: '' },
  { front: 'пожалуйста', back: 'please / you are welcome', example: 'Пожалуйста, садитесь.', note: 'both meanings' },
  { front: 'да', back: 'yes', example: 'Да, конечно.', note: '' },
  { front: 'нет', back: 'no', example: 'Нет, спасибо.', note: '' },
  { front: 'вода', back: 'water', example: 'Дайте, пожалуйста, воды.', note: 'feminine noun' },
  { front: 'хлеб', back: 'bread', example: 'Я купил свежий хлеб.', note: 'masculine noun' },
  { front: 'друг', back: 'friend', example: 'Он мой старый друг.', note: 'masculine; feminine is подруга' },
  { front: 'дом', back: 'house / home', example: 'Я иду домой.', note: '' },
  { front: 'книга', back: 'book', example: 'Это интересная книга.', note: 'feminine noun' },
  { front: 'время', back: 'time', example: 'У меня нет времени.', note: 'neuter noun' },
  { front: 'город', back: 'city', example: 'Москва — большой город.', note: '' },
  { front: 'работа', back: 'work / job', example: 'Мне нравится моя работа.', note: '' },
  { front: 'сегодня', back: 'today', example: 'Сегодня хорошая погода.', note: '' },
  { front: 'завтра', back: 'tomorrow', example: 'Увидимся завтра.', note: '' },
  { front: 'хорошо', back: 'good / well', example: 'Всё хорошо.', note: '' },
  { front: 'любить', back: 'to love', example: 'Я люблю читать.', note: 'verb, imperfective' },
  { front: 'говорить', back: 'to speak / to say', example: 'Вы говорите по-русски?', note: 'verb, imperfective' },
  { front: 'знать', back: 'to know', example: 'Я не знаю ответа.', note: 'verb' },
  { front: 'учить', back: 'to learn / to study', example: 'Я учу русский язык.', note: 'verb' },
  { front: 'язык', back: 'language / tongue', example: 'Русский язык — красивый.', note: 'masculine noun' },
  { front: 'человек', back: 'person / human', example: 'Он хороший человек.', note: 'plural is люди' }
]
