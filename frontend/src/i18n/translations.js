// Full i18n translations for Song2Learn
// Languages: en, ru, fr, de, es, pt, pl, zh, hi, ar

export const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', rtl: true },
]

export const translations = {
  // ============ COMMON ============
  common: {
    search: {
      en: 'Search', ru: 'Поиск', fr: 'Rechercher', de: 'Suchen', es: 'Buscar',
      pt: 'Pesquisar', pl: 'Szukaj', zh: '搜索', hi: 'खोजें', ar: 'بحث'
    },
    saved: {
      en: 'Saved', ru: 'Сохранённые', fr: 'Enregistrés', de: 'Gespeichert', es: 'Guardados',
      pt: 'Salvos', pl: 'Zapisane', zh: '已保存', hi: 'सहेजे गए', ar: 'المحفوظة'
    },
    vocabulary: {
      en: 'Vocabulary', ru: 'Словарь', fr: 'Vocabulaire', de: 'Vokabeln', es: 'Vocabulario',
      pt: 'Vocabulário', pl: 'Słownictwo', zh: '词汇', hi: 'शब्दावली', ar: 'المفردات'
    },
    exercises: {
      en: 'Exercises', ru: 'Упражнения', fr: 'Exercices', de: 'Übungen', es: 'Ejercicios',
      pt: 'Exercícios', pl: 'Ćwiczenia', zh: '练习', hi: 'अभ्यास', ar: 'تمارين'
    },
    logout: {
      en: 'Logout', ru: 'Выйти', fr: 'Déconnexion', de: 'Abmelden', es: 'Salir',
      pt: 'Sair', pl: 'Wyloguj', zh: '登出', hi: 'लॉग आउट', ar: 'تسجيل خروج'
    },
    loading: {
      en: 'Loading...', ru: 'Загрузка...', fr: 'Chargement...', de: 'Laden...', es: 'Cargando...',
      pt: 'Carregando...', pl: 'Ładowanie...', zh: '加载中...', hi: 'लोड हो रहा है...', ar: 'جار التحميل...'
    },
    import: {
      en: 'Import', ru: 'Добавить', fr: 'Importer', de: 'Importieren', es: 'Importar',
      pt: 'Importar', pl: 'Importuj', zh: '导入', hi: 'आयात करें', ar: 'استيراد'
    },
    learning: {
      en: 'Learning', ru: 'Изучаю', fr: 'J\'apprends', de: 'Lerne', es: 'Aprendiendo',
      pt: 'Aprendendo', pl: 'Uczę się', zh: '正在学习', hi: 'सीख रहा हूँ', ar: 'أتعلم'
    },
    findSongs: {
      en: 'Find Songs', ru: 'Найти песни', fr: 'Trouver des chansons', de: 'Lieder finden',
      es: 'Buscar canciones', pt: 'Encontrar músicas', pl: 'Znajdź piosenki',
      zh: '查找歌曲', hi: 'गाने खोजें', ar: 'ابحث عن أغاني'
    },
    add: {
      en: 'Add', ru: 'Добавить', fr: 'Ajouter', de: 'Hinzufügen', es: 'Añadir',
      pt: 'Adicionar', pl: 'Dodaj', zh: '添加', hi: 'जोड़ें', ar: 'إضافة'
    },
    cancel: {
      en: 'Cancel', ru: 'Отмена', fr: 'Annuler', de: 'Abbrechen', es: 'Cancelar',
      pt: 'Cancelar', pl: 'Anuluj', zh: '取消', hi: 'रद्द करें', ar: 'إلغاء'
    },
    or: {
      en: 'or', ru: 'или', fr: 'ou', de: 'oder', es: 'o',
      pt: 'ou', pl: 'lub', zh: '或', hi: 'या', ar: 'أو'
    },
    listen: {
      en: 'Listen', ru: 'Слушать', fr: 'Écouter', de: 'Anhören', es: 'Escuchar',
      pt: 'Ouvir', pl: 'Słuchaj', zh: '听', hi: 'सुनें', ar: 'استمع'
    },
    back: {
      en: 'Back', ru: 'Назад', fr: 'Retour', de: 'Zurück', es: 'Volver',
      pt: 'Voltar', pl: 'Wstecz', zh: '返回', hi: 'वापस', ar: 'رجوع'
    },
    next: {
      en: 'Next', ru: 'Далее', fr: 'Suivant', de: 'Weiter', es: 'Siguiente',
      pt: 'Próximo', pl: 'Dalej', zh: '下一个', hi: 'अगला', ar: 'التالي'
    },
    previous: {
      en: 'Previous', ru: 'Назад', fr: 'Précédent', de: 'Vorherige', es: 'Anterior',
      pt: 'Anterior', pl: 'Poprzedni', zh: '上一个', hi: 'पिछला', ar: 'السابق'
    },
    reset: {
      en: 'Reset', ru: 'Сбросить', fr: 'Réinitialiser', de: 'Zurücksetzen', es: 'Reiniciar',
      pt: 'Reiniciar', pl: 'Resetuj', zh: '重置', hi: 'रीसेट', ar: 'إعادة تعيين'
    },
    iLearn: {
      en: 'I learn', ru: 'Учу', fr: "J'apprends", de: 'Ich lerne', es: 'Aprendo',
      pt: 'Aprendo', pl: 'Uczę się', zh: '我学', hi: 'मैं सीखता हूँ', ar: 'أتعلم'
    },
    iLearnTooltip: {
      en: 'The language you are learning', ru: 'Язык, который вы изучаете', fr: 'La langue que vous apprenez',
      de: 'Die Sprache, die Sie lernen', es: 'El idioma que estás aprendiendo', pt: 'O idioma que você está aprendendo',
      pl: 'Język, którego się uczysz', zh: '您正在学习的语言', hi: 'जो भाषा आप सीख रहे हैं', ar: 'اللغة التي تتعلمها'
    },
    translateToTooltip: {
      en: 'Translation will be shown in this language', ru: 'Перевод будет на этом языке',
      fr: 'La traduction sera affichée dans cette langue', de: 'Übersetzung wird in dieser Sprache angezeigt',
      es: 'La traducción se mostrará en este idioma', pt: 'A tradução será mostrada neste idioma',
      pl: 'Tłumaczenie będzie w tym języku', zh: '翻译将以此语言显示', hi: 'अनुवाद इस भाषा में दिखाया जाएगा', ar: 'ستظهر الترجمة بهذه اللغة'
    },
    translateTo: {
      en: 'translate to', ru: 'на', fr: 'traduire en', de: 'übersetzen in',
      es: 'traducir a', pt: 'traduzir para', pl: 'tłumacz na',
      zh: '翻译成', hi: 'में अनुवाद करें', ar: 'ترجم إلى'
    },
  },

  // ============ SEARCH PAGE ============
  search: {
    title: {
      en: 'Find a Song', ru: 'Найти песню', fr: 'Trouver une chanson', de: 'Lied finden',
      es: 'Buscar canción', pt: 'Encontrar música', pl: 'Znajdź piosenkę',
      zh: '查找歌曲', hi: 'गाना खोजें', ar: 'ابحث عن أغنية'
    },
    subtitle: {
      en: 'Search for songs to start learning',
      ru: 'Ищите песни чтобы начать обучение',
      fr: 'Recherchez des chansons pour commencer à apprendre',
      de: 'Suchen Sie nach Liedern zum Lernen',
      es: 'Busca canciones para empezar a aprender',
      pt: 'Procure músicas para começar a aprender',
      pl: 'Szukaj piosenek, aby zacząć się uczyć',
      zh: '搜索歌曲开始学习',
      hi: 'सीखना शुरू करने के लिए गाने खोजें',
      ar: 'ابحث عن الأغاني لبدء التعلم'
    },
    helpText: {
      en: '💡 Search for any song by title or artist. We\'ll fetch the lyrics so you can learn the language through music!',
      ru: '💡 Ищите любую песню по названию или исполнителю. Мы найдём текст, и вы сможете учить язык через музыку!',
      fr: '💡 Recherchez n\'importe quelle chanson par titre ou artiste. Nous récupérerons les paroles pour apprendre la langue en musique!',
      de: '💡 Suchen Sie nach einem Lied nach Titel oder Künstler. Wir holen den Text, damit Sie die Sprache durch Musik lernen können!',
      es: '💡 Busca cualquier canción por título o artista. ¡Obtendremos la letra para que aprendas el idioma a través de la música!',
      pt: '💡 Pesquise qualquer música por título ou artista. Buscaremos a letra para você aprender o idioma através da música!',
      pl: '💡 Szukaj dowolnej piosenki po tytule lub artyście. Pobierzemy tekst, abyś mógł uczyć się języka przez muzykę!',
      zh: '💡 按标题或艺术家搜索任何歌曲。我们会获取歌词，让你通过音乐学习语言！',
      hi: '💡 किसी भी गाने को शीर्षक या कलाकार द्वारा खोजें। हम गीत लाएंगे ताकि आप संगीत के माध्यम से भाषा सीख सकें!',
      ar: '💡 ابحث عن أي أغنية بالعنوان أو الفنان. سنحضر كلمات الأغنية لتتعلم اللغة من خلال الموسيقى!'
    },
    surpriseMe: {
      en: 'Surprise me with iconic {lang} song',
      ru: 'Удиви меня культовой песней на {lang}',
      fr: 'Surprends-moi avec une chanson iconique en {lang}',
      de: 'Überrasche mich mit einem ikonischen {lang} Lied',
      es: 'Sorpréndeme con una canción icónica en {lang}',
      pt: 'Surpreenda-me com uma música icônica em {lang}',
      pl: 'Zaskocz mnie kultową piosenką w {lang}',
      zh: '用标志性的{lang}歌曲给我惊喜',
      hi: '{lang} के प्रतिष्ठित गाने से मुझे आश्चर्यचकित करें',
      ar: 'فاجئني بأغنية {lang} مميزة'
    },
    placeholder: {
      en: 'Search by song title or artist...',
      ru: 'Поиск по названию или исполнителю...',
      fr: 'Rechercher par titre ou artiste...',
      de: 'Nach Titel oder Künstler suchen...',
      es: 'Buscar por título o artista...',
      pt: 'Pesquisar por título ou artista...',
      pl: 'Szukaj po tytule lub artyście...',
      zh: '按歌曲名称或艺术家搜索...',
      hi: 'गाने के शीर्षक या कलाकार द्वारा खोजें...',
      ar: 'البحث بعنوان الأغنية أو الفنان...'
    },
    results: {
      en: 'Results', ru: 'Результаты', fr: 'Résultats', de: 'Ergebnisse', es: 'Resultados',
      pt: 'Resultados', pl: 'Wyniki', zh: '结果', hi: 'परिणाम', ar: 'النتائج'
    },
    noResults: {
      en: 'No songs found', ru: 'Песни не найдены', fr: 'Aucune chanson trouvée', de: 'Keine Lieder gefunden',
      es: 'No se encontraron canciones', pt: 'Nenhuma música encontrada', pl: 'Nie znaleziono piosenek',
      zh: '未找到歌曲', hi: 'कोई गाना नहीं मिला', ar: 'لم يتم العثور على أغاني'
    },
    emptyState: {
      en: 'Search for a song to get started',
      ru: 'Найдите песню, чтобы начать',
      fr: 'Recherchez une chanson pour commencer',
      de: 'Suchen Sie ein Lied, um zu beginnen',
      es: 'Busca una canción para empezar',
      pt: 'Procure uma música para começar',
      pl: 'Wyszukaj piosenkę, aby zacząć',
      zh: '搜索歌曲开始',
      hi: 'शुरू करने के लिए कोई गाना खोजें',
      ar: 'ابحث عن أغنية للبدء'
    },
  },

  // ============ SAVED PAGE ============
  saved: {
    title: {
      en: 'Saved Songs', ru: 'Сохранённые песни', fr: 'Chansons enregistrées', de: 'Gespeicherte Lieder',
      es: 'Canciones guardadas', pt: 'Músicas salvas', pl: 'Zapisane piosenki',
      zh: '已保存的歌曲', hi: 'सहेजे गए गाने', ar: 'الأغاني المحفوظة'
    },
    helpText: {
      en: '💡 Your saved songs appear here. Click any song to continue learning where you left off.',
      ru: '💡 Здесь отображаются ваши сохранённые песни. Нажмите на любую, чтобы продолжить обучение.',
      fr: '💡 Vos chansons enregistrées apparaissent ici. Cliquez sur une chanson pour continuer à apprendre.',
      de: '💡 Ihre gespeicherten Lieder erscheinen hier. Klicken Sie auf ein Lied, um weiterzulernen.',
      es: '💡 Tus canciones guardadas aparecen aquí. Haz clic en cualquier canción para seguir aprendiendo.',
      pt: '💡 Suas músicas salvas aparecem aqui. Clique em qualquer música para continuar aprendendo.',
      pl: '💡 Twoje zapisane piosenki pojawiają się tutaj. Kliknij dowolną piosenkę, aby kontynuować naukę.',
      zh: '💡 您保存的歌曲显示在这里。点击任何歌曲继续学习。',
      hi: '💡 आपके सहेजे गए गाने यहाँ दिखाई देते हैं। सीखना जारी रखने के लिए किसी भी गाने पर क्लिक करें।',
      ar: '💡 تظهر أغانيك المحفوظة هنا. انقر على أي أغنية لمواصلة التعلم.'
    },
    empty: {
      en: 'No saved songs yet',
      ru: 'Пока нет сохранённых песен',
      fr: 'Pas encore de chansons enregistrées',
      de: 'Noch keine gespeicherten Lieder',
      es: 'Aún no hay canciones guardadas',
      pt: 'Nenhuma música salva ainda',
      pl: 'Brak zapisanych piosenek',
      zh: '还没有保存的歌曲',
      hi: 'अभी तक कोई गाना सहेजा नहीं गया',
      ar: 'لا توجد أغاني محفوظة بعد'
    },
    emptySubtitle: {
      en: 'Songs you save will appear here',
      ru: 'Песни, которые вы сохраните, появятся здесь',
      fr: 'Les chansons que vous enregistrez apparaîtront ici',
      de: 'Lieder, die Sie speichern, erscheinen hier',
      es: 'Las canciones que guardes aparecerán aquí',
      pt: 'As músicas que você salvar aparecerão aqui',
      pl: 'Piosenki, które zapiszesz, pojawią się tutaj',
      zh: '您保存的歌曲将显示在这里',
      hi: 'जो गाने आप सहेजेंगे वे यहाँ दिखाई देंगे',
      ar: 'ستظهر الأغاني التي تحفظها هنا'
    },
  },

  // ============ VOCABULARY PAGE ============
  vocabulary: {
    title: {
      en: 'My Vocabulary', ru: 'Мой словарь', fr: 'Mon vocabulaire', de: 'Mein Vokabular',
      es: 'Mi vocabulario', pt: 'Meu vocabulário', pl: 'Moje słownictwo',
      zh: '我的词汇', hi: 'मेरी शब्दावली', ar: 'مفرداتي'
    },
    helpText: {
      en: '💡 Words you save from songs appear here. Review them regularly to improve retention!',
      ru: '💡 Слова, которые вы сохраняете из песен, появляются здесь. Регулярно повторяйте их!',
      fr: '💡 Les mots que vous enregistrez des chansons apparaissent ici. Révisez-les régulièrement!',
      de: '💡 Wörter, die Sie aus Liedern speichern, erscheinen hier. Wiederholen Sie sie regelmäßig!',
      es: '💡 Las palabras que guardas de las canciones aparecen aquí. ¡Repásalas regularmente!',
      pt: '💡 Palavras que você salva das músicas aparecem aqui. Revise-as regularmente!',
      pl: '💡 Słowa, które zapisujesz z piosenek, pojawiają się tutaj. Regularnie je powtarzaj!',
      zh: '💡 您从歌曲中保存的单词显示在这里。定期复习以提高记忆力！',
      hi: '💡 गानों से सहेजे गए शब्द यहाँ दिखाई देते हैं। याद रखने के लिए नियमित रूप से दोहराएं!',
      ar: '💡 الكلمات التي تحفظها من الأغاني تظهر هنا. راجعها بانتظام لتحسين الحفظ!'
    },
    empty: {
      en: 'Your vocabulary is empty',
      ru: 'Ваш словарь пуст',
      fr: 'Votre vocabulaire est vide',
      de: 'Ihr Vokabular ist leer',
      es: 'Tu vocabulario está vacío',
      pt: 'Seu vocabulário está vazio',
      pl: 'Twoje słownictwo jest puste',
      zh: '您的词汇表是空的',
      hi: 'आपकी शब्दावली खाली है',
      ar: 'مفرداتك فارغة'
    },
    emptySubtitle: {
      en: 'Add words while learning songs or manually',
      ru: 'Добавляйте слова из песен или вручную',
      fr: 'Ajoutez des mots en apprenant des chansons ou manuellement',
      de: 'Fügen Sie Wörter beim Lernen von Liedern oder manuell hinzu',
      es: 'Añade palabras mientras aprendes canciones o manualmente',
      pt: 'Adicione palavras enquanto aprende músicas ou manualmente',
      pl: 'Dodawaj słowa ucząc się piosenek lub ręcznie',
      zh: '在学习歌曲时或手动添加单词',
      hi: 'गाने सीखते समय या मैन्युअल रूप से शब्द जोड़ें',
      ar: 'أضف كلمات أثناء تعلم الأغاني أو يدويًا'
    },
    addWord: {
      en: 'Add Word', ru: 'Добавить слово', fr: 'Ajouter un mot', de: 'Wort hinzufügen',
      es: 'Añadir palabra', pt: 'Adicionar palavra', pl: 'Dodaj słowo',
      zh: '添加单词', hi: 'शब्द जोड़ें', ar: 'أضف كلمة'
    },
    addNewWord: {
      en: 'Add New Word', ru: 'Добавить новое слово', fr: 'Ajouter un nouveau mot',
      de: 'Neues Wort hinzufügen', es: 'Añadir nueva palabra', pt: 'Adicionar nova palavra',
      pl: 'Dodaj nowe słowo', zh: '添加新单词', hi: 'नया शब्द जोड़ें', ar: 'أضف كلمة جديدة'
    },
    addFirstWord: {
      en: 'Add Your First Word', ru: 'Добавьте первое слово', fr: 'Ajoutez votre premier mot',
      de: 'Fügen Sie Ihr erstes Wort hinzu', es: 'Añade tu primera palabra',
      pt: 'Adicione sua primeira palavra', pl: 'Dodaj swoje pierwsze słowo',
      zh: '添加您的第一个单词', hi: 'अपना पहला शब्द जोड़ें', ar: 'أضف كلمتك الأولى'
    },
    word: {
      en: 'Word', ru: 'Слово', fr: 'Mot', de: 'Wort', es: 'Palabra',
      pt: 'Palavra', pl: 'Słowo', zh: '单词', hi: 'शब्द', ar: 'كلمة'
    },
    translation: {
      en: 'Translation', ru: 'Перевод', fr: 'Traduction', de: 'Übersetzung', es: 'Traducción',
      pt: 'Tradução', pl: 'Tłumaczenie', zh: '翻译', hi: 'अनुवाद', ar: 'ترجمة'
    },
    context: {
      en: 'Context (optional)', ru: 'Контекст (необязательно)', fr: 'Contexte (optionnel)',
      de: 'Kontext (optional)', es: 'Contexto (opcional)', pt: 'Contexto (opcional)',
      pl: 'Kontekst (opcjonalnie)', zh: '上下文（可选）', hi: 'संदर्भ (वैकल्पिक)', ar: 'السياق (اختياري)'
    },
    enterWord: {
      en: 'Enter word', ru: 'Введите слово', fr: 'Entrez le mot', de: 'Wort eingeben',
      es: 'Ingresa la palabra', pt: 'Digite a palavra', pl: 'Wpisz słowo',
      zh: '输入单词', hi: 'शब्द दर्ज करें', ar: 'أدخل الكلمة'
    },
    enterTranslation: {
      en: 'Enter translation', ru: 'Введите перевод', fr: 'Entrez la traduction',
      de: 'Übersetzung eingeben', es: 'Ingresa la traducción', pt: 'Digite a tradução',
      pl: 'Wpisz tłumaczenie', zh: '输入翻译', hi: 'अनुवाद दर्ज करें', ar: 'أدخل الترجمة'
    },
    exampleContext: {
      en: 'Example sentence or context', ru: 'Пример предложения или контекст',
      fr: 'Phrase d\'exemple ou contexte', de: 'Beispielsatz oder Kontext',
      es: 'Frase de ejemplo o contexto', pt: 'Frase de exemplo ou contexto',
      pl: 'Przykładowe zdanie lub kontekst', zh: '例句或上下文',
      hi: 'उदाहरण वाक्य या संदर्भ', ar: 'جملة مثال أو سياق'
    },
    adding: {
      en: 'Adding...', ru: 'Добавляю...', fr: 'Ajout...', de: 'Hinzufügen...',
      es: 'Añadiendo...', pt: 'Adicionando...', pl: 'Dodawanie...',
      zh: '添加中...', hi: 'जोड़ रहा है...', ar: 'جار الإضافة...'
    },
  },

  // ============ EXERCISES PAGE ============
  exercises: {
    title: {
      en: 'Translation Exercises', ru: 'Упражнения на перевод', fr: 'Exercices de traduction',
      de: 'Übersetzungsübungen', es: 'Ejercicios de traducción', pt: 'Exercícios de tradução',
      pl: 'Ćwiczenia tłumaczeniowe', zh: '翻译练习', hi: 'अनुवाद अभ्यास', ar: 'تمارين الترجمة'
    },
    helpText: {
      en: '💡 Test your knowledge! Translate lyrics from your saved songs and get instant AI feedback.',
      ru: '💡 Проверьте свои знания! Переводите строки из сохранённых песен и получайте мгновенную обратную связь от ИИ.',
      fr: '💡 Testez vos connaissances! Traduisez les paroles de vos chansons et obtenez un feedback IA instantané.',
      de: '💡 Testen Sie Ihr Wissen! Übersetzen Sie Liedtexte und erhalten Sie sofortiges KI-Feedback.',
      es: '💡 ¡Pon a prueba tus conocimientos! Traduce letras y obtén retroalimentación instantánea de la IA.',
      pt: '💡 Teste seus conhecimentos! Traduza letras e receba feedback instantâneo da IA.',
      pl: '💡 Sprawdź swoją wiedzę! Tłumacz teksty piosenek i otrzymuj natychmiastową opinię AI.',
      zh: '💡 测试你的知识！翻译歌词并获得即时AI反馈。',
      hi: '💡 अपने ज्ञान का परीक्षण करें! गानों के बोल का अनुवाद करें और तुरंत AI प्रतिक्रिया पाएं।',
      ar: '💡 اختبر معرفتك! ترجم كلمات الأغاني واحصل على ملاحظات فورية من الذكاء الاصطناعي.'
    },
    chooseSong: {
      en: 'Choose a song to practice translating its lyrics:',
      ru: 'Выберите песню для практики перевода:',
      fr: 'Choisissez une chanson pour pratiquer la traduction:',
      de: 'Wählen Sie ein Lied zum Übersetzen:',
      es: 'Elige una canción para practicar la traducción:',
      pt: 'Escolha uma música para praticar a tradução:',
      pl: 'Wybierz piosenkę do ćwiczenia tłumaczenia:',
      zh: '选择一首歌来练习翻译：',
      hi: 'अनुवाद अभ्यास के लिए एक गाना चुनें:',
      ar: 'اختر أغنية للتدرب على ترجمتها:'
    },
    noSongs: {
      en: 'No songs to practice with',
      ru: 'Нет песен для практики',
      fr: 'Pas de chansons pour pratiquer',
      de: 'Keine Lieder zum Üben',
      es: 'No hay canciones para practicar',
      pt: 'Sem músicas para praticar',
      pl: 'Brak piosenek do ćwiczeń',
      zh: '没有歌曲可供练习',
      hi: 'अभ्यास के लिए कोई गाना नहीं',
      ar: 'لا توجد أغاني للتدريب'
    },
    noSongsSubtitle: {
      en: 'Save some songs first to practice translation',
      ru: 'Сначала сохраните несколько песен',
      fr: 'Enregistrez d\'abord des chansons pour pratiquer',
      de: 'Speichern Sie zuerst einige Lieder',
      es: 'Guarda algunas canciones primero',
      pt: 'Salve algumas músicas primeiro',
      pl: 'Najpierw zapisz kilka piosenek',
      zh: '先保存一些歌曲以练习翻译',
      hi: 'पहले कुछ गाने सहेजें',
      ar: 'احفظ بعض الأغاني أولاً للتدرب'
    },
    backToSongs: {
      en: '← Back to songs', ru: '← К песням', fr: '← Retour aux chansons',
      de: '← Zurück zu Liedern', es: '← Volver a canciones', pt: '← Voltar às músicas',
      pl: '← Wróć do piosenek', zh: '← 返回歌曲', hi: '← गानों पर वापस', ar: '← العودة للأغاني'
    },
    translate: {
      en: 'Translate this line:', ru: 'Переведите эту строку:', fr: 'Traduisez cette ligne:',
      de: 'Übersetzen Sie diese Zeile:', es: 'Traduce esta línea:', pt: 'Traduza esta linha:',
      pl: 'Przetłumacz tę linię:', zh: '翻译这行：', hi: 'इस पंक्ति का अनुवाद करें:', ar: 'ترجم هذا السطر:'
    },
    typePlaceholder: {
      en: 'Type your translation here...', ru: 'Введите перевод здесь...',
      fr: 'Tapez votre traduction ici...', de: 'Geben Sie Ihre Übersetzung hier ein...',
      es: 'Escribe tu traducción aquí...', pt: 'Digite sua tradução aqui...',
      pl: 'Wpisz swoje tłumaczenie tutaj...', zh: '在此输入您的翻译...',
      hi: 'अपना अनुवाद यहाँ टाइप करें...', ar: 'اكتب ترجمتك هنا...'
    },
    checkTranslation: {
      en: 'Check Translation', ru: 'Проверить перевод', fr: 'Vérifier la traduction',
      de: 'Übersetzung prüfen', es: 'Comprobar traducción', pt: 'Verificar tradução',
      pl: 'Sprawdź tłumaczenie', zh: '检查翻译', hi: 'अनुवाद जांचें', ar: 'تحقق من الترجمة'
    },
    checking: {
      en: 'Checking...', ru: 'Проверяю...', fr: 'Vérification...', de: 'Prüfen...',
      es: 'Comprobando...', pt: 'Verificando...', pl: 'Sprawdzanie...',
      zh: '检查中...', hi: 'जाँच रहा है...', ar: 'جار التحقق...'
    },
    correct: {
      en: 'Correct!', ru: 'Правильно!', fr: 'Correct!', de: 'Richtig!', es: '¡Correcto!',
      pt: 'Correto!', pl: 'Poprawnie!', zh: '正确！', hi: 'सही!', ar: 'صحيح!'
    },
    notQuite: {
      en: 'Not quite right', ru: 'Не совсем верно', fr: 'Pas tout à fait',
      de: 'Nicht ganz richtig', es: 'No del todo', pt: 'Não está correto',
      pl: 'Nie do końca', zh: '不太对', hi: 'बिल्कुल सही नहीं', ar: 'ليس صحيحًا تمامًا'
    },
    suggestedTranslation: {
      en: 'Suggested translation:', ru: 'Рекомендуемый перевод:', fr: 'Traduction suggérée:',
      de: 'Vorgeschlagene Übersetzung:', es: 'Traducción sugerida:', pt: 'Tradução sugerida:',
      pl: 'Sugerowane tłumaczenie:', zh: '建议翻译：', hi: 'सुझाया गया अनुवाद:', ar: 'الترجمة المقترحة:'
    },
    lineOf: {
      en: 'Line {current} of {total}', ru: 'Строка {current} из {total}',
      fr: 'Ligne {current} sur {total}', de: 'Zeile {current} von {total}',
      es: 'Línea {current} de {total}', pt: 'Linha {current} de {total}',
      pl: 'Linia {current} z {total}', zh: '第{current}行，共{total}行',
      hi: 'पंक्ति {current} / {total}', ar: 'السطر {current} من {total}'
    },
    nextLine: {
      en: 'Next Line', ru: 'Следующая строка', fr: 'Ligne suivante', de: 'Nächste Zeile',
      es: 'Siguiente línea', pt: 'Próxima linha', pl: 'Następna linia',
      zh: '下一行', hi: 'अगली पंक्ति', ar: 'السطر التالي'
    },
  },

  // ============ SONG VIEW PAGE ============
  song: {
    helpText: {
      en: '💡 Hover over any line to see translation and grammar notes. Double-click to hear pronunciation. Save words to vocabulary!',
      ru: '💡 Наведите на строку для перевода и грамматики. Двойной клик — прослушать произношение. Сохраняйте слова в словарь!',
      fr: '💡 Survolez une ligne pour voir la traduction et les notes de grammaire. Double-cliquez pour écouter. Enregistrez les mots!',
      de: '💡 Fahren Sie über eine Zeile für Übersetzung und Grammatik. Doppelklick zum Anhören. Speichern Sie Wörter!',
      es: '💡 Pasa el cursor sobre una línea para ver la traducción y notas gramaticales. Doble clic para escuchar. ¡Guarda palabras!',
      pt: '💡 Passe o mouse sobre uma linha para ver tradução e notas gramaticais. Clique duas vezes para ouvir. Salve palavras!',
      pl: '💡 Najedź na linię, aby zobaczyć tłumaczenie i notatki gramatyczne. Kliknij dwukrotnie, aby posłuchać. Zapisuj słowa!',
      zh: '💡 将鼠标悬停在任何行上查看翻译和语法注释。双击收听发音。将单词保存到词汇表！',
      hi: '💡 अनुवाद और व्याकरण नोट्स देखने के लिए किसी भी पंक्ति पर होवर करें। उच्चारण सुनने के लिए डबल-क्लिक करें। शब्दों को सहेजें!',
      ar: '💡 مرر فوق أي سطر لرؤية الترجمة وملاحظات القواعد. انقر نقرًا مزدوجًا للاستماع. احفظ الكلمات!'
    },
    listen: {
      en: 'Listen', ru: 'Слушать', fr: 'Écouter', de: 'Anhören', es: 'Escuchar',
      pt: 'Ouvir', pl: 'Słuchaj', zh: '听', hi: 'सुनें', ar: 'استمع'
    },
    save: {
      en: 'Save', ru: 'Сохранить', fr: 'Enregistrer', de: 'Speichern', es: 'Guardar',
      pt: 'Salvar', pl: 'Zapisz', zh: '保存', hi: 'सहेजें', ar: 'حفظ'
    },
    analysis: {
      en: 'Analysis', ru: 'Анализ', fr: 'Analyse', de: 'Analyse', es: 'Análisis',
      pt: 'Análise', pl: 'Analiza', zh: '分析', hi: 'विश्लेषण', ar: 'تحليل'
    },
    grammar: {
      en: 'Grammar', ru: 'Грамматика', fr: 'Grammaire', de: 'Grammatik', es: 'Gramática',
      pt: 'Gramática', pl: 'Gramatyka', zh: '语法', hi: 'व्याकरण', ar: 'قواعد'
    },
    culturalNote: {
      en: 'Cultural note', ru: 'Культурная заметка', fr: 'Note culturelle', de: 'Kulturelle Notiz',
      es: 'Nota cultural', pt: 'Nota cultural', pl: 'Uwaga kulturowa', zh: '文化注释',
      hi: 'सांस्कृतिक नोट', ar: 'ملاحظة ثقافية'
    },
    hoverHint: {
      en: 'Hover or tap a line', ru: 'Наведите или нажмите на строку', fr: 'Survolez ou appuyez sur une ligne',
      de: 'Fahren Sie über eine Zeile oder tippen Sie', es: 'Pasa el cursor o toca una línea',
      pt: 'Passe o mouse ou toque em uma linha', pl: 'Najedź lub dotknij linii',
      zh: '悬停或点击一行', hi: 'किसी पंक्ति पर होवर या टैप करें', ar: 'مرر أو انقر على سطر'
    },
    storyButton: {
      en: 'Learn the story behind this song', ru: 'Узнать историю этой песни', fr: "Découvrir l'histoire de cette chanson",
      de: 'Die Geschichte hinter diesem Lied', es: 'Conoce la historia de esta canción',
      pt: 'Conheça a história desta música', pl: 'Poznaj historię tej piosenki',
      zh: '了解这首歌的故事', hi: 'इस गाने की कहानी जानें', ar: 'تعرف على قصة هذه الأغنية'
    },
    storyLoading: {
      en: 'Researching the story...', ru: 'Ищем историю...', fr: "Recherche de l'histoire...",
      de: 'Geschichte wird recherchiert...', es: 'Investigando la historia...',
      pt: 'Pesquisando a história...', pl: 'Szukam historii...',
      zh: '正在研究故事...', hi: 'कहानी खोज रहा है...', ar: 'جار البحث عن القصة...'
    },
    storyTitle: {
      en: 'Story behind the song', ru: 'История песни', fr: "L'histoire de la chanson",
      de: 'Geschichte des Liedes', es: 'Historia de la canción',
      pt: 'História da música', pl: 'Historia piosenki',
      zh: '歌曲背后的故事', hi: 'गाने की कहानी', ar: 'قصة الأغنية'
    },
    whyIconic: {
      en: 'Why this song is iconic', ru: 'Почему эта песня культовая',
      fr: 'Pourquoi cette chanson est iconique', de: 'Warum dieses Lied ikonisch ist',
      es: 'Por qué esta canción es icónica', pt: 'Por que esta música é icônica',
      pl: 'Dlaczego ta piosenka jest kultowa', zh: '为什么这首歌是标志性的',
      hi: 'यह गाना प्रतिष्ठित क्यों है', ar: 'لماذا هذه الأغنية مميزة'
    },
    saved: {
      en: 'Saved', ru: 'Сохранено', fr: 'Enregistré', de: 'Gespeichert',
      es: 'Guardado', pt: 'Salvo', pl: 'Zapisane', zh: '已保存', hi: 'सहेजा गया', ar: 'تم الحفظ'
    },
    notFound: {
      en: 'Song not found', ru: 'Песня не найдена', fr: 'Chanson introuvable',
      de: 'Lied nicht gefunden', es: 'Canción no encontrada', pt: 'Música não encontrada',
      pl: 'Nie znaleziono piosenki', zh: '未找到歌曲', hi: 'गाना नहीं मिला', ar: 'الأغنية غير موجودة'
    },
    tip: {
      en: 'Tip', ru: 'Подсказка', fr: 'Astuce', de: 'Tipp',
      es: 'Consejo', pt: 'Dica', pl: 'Wskazówka', zh: '提示', hi: 'टिप', ar: 'نصيحة'
    },
    tipText: {
      en: 'Hover over any line for instant analysis, or click to lock it. Use the speaker icon to hear pronunciation.',
      ru: 'Наведите на строку для анализа или кликните чтобы закрепить. Используйте иконку динамика для произношения.',
      fr: "Survolez une ligne pour l'analyser ou cliquez pour la verrouiller. Utilisez l'icône du haut-parleur pour écouter.",
      de: 'Fahren Sie über eine Zeile für Analyse oder klicken Sie zum Fixieren. Verwenden Sie das Lautsprecher-Symbol zum Anhören.',
      es: 'Pasa el cursor para analizar, o clic para fijar. Usa el icono del altavoz para escuchar.',
      pt: 'Passe o mouse para análise ou clique para fixar. Use o ícone do alto-falante para ouvir.',
      pl: 'Najedź na linię, aby ją analizować, lub kliknij, aby zablokować. Użyj ikony głośnika, aby posłuchać.',
      zh: '悬停在行上进行分析，或点击锁定。使用扬声器图标收听发音。',
      hi: 'विश्लेषण के लिए किसी पंक्ति पर होवर करें, या लॉक करने के लिए क्लिक करें। उच्चारण सुनने के लिए स्पीकर आइकन का उपयोग करें।',
      ar: 'مرر فوق أي سطر للتحليل الفوري، أو انقر لتثبيته. استخدم أيقونة السماعة للاستماع.'
    },
    analyzing: {
      en: 'Analyzing...', ru: 'Анализ...', fr: 'Analyse...', de: 'Analyse...',
      es: 'Analizando...', pt: 'Analisando...', pl: 'Analizowanie...',
      zh: '分析中...', hi: 'विश्लेषण...', ar: 'جار التحليل...'
    },
    wordByWord: {
      en: 'Word-by-word', ru: 'Пословно', fr: 'Mot à mot', de: 'Wort für Wort',
      es: 'Palabra por palabra', pt: 'Palavra por palavra', pl: 'Słowo po słowie',
      zh: '逐词', hi: 'शब्द-दर-शब्द', ar: 'كلمة بكلمة'
    },
    hideInterlinear: {
      en: 'Hide interlinear', ru: 'Скрыть', fr: 'Masquer', de: 'Ausblenden',
      es: 'Ocultar', pt: 'Ocultar', pl: 'Ukryj',
      zh: '隐藏', hi: 'छुपाएं', ar: 'إخفاء'
    },
    translation: {
      en: 'Translation', ru: 'Перевод', fr: 'Traduction', de: 'Übersetzung',
      es: 'Traducción', pt: 'Tradução', pl: 'Tłumaczenie',
      zh: '翻译', hi: 'अनुवाद', ar: 'ترجمة'
    },
    saveToVocab: {
      en: 'Save to vocabulary', ru: 'Сохранить в словарь', fr: 'Enregistrer dans le vocabulaire',
      de: 'Zum Vokabular speichern', es: 'Guardar en vocabulario', pt: 'Salvar no vocabulário',
      pl: 'Zapisz do słownika', zh: '保存到词汇表', hi: 'शब्दावली में सहेजें', ar: 'حفظ في المفردات'
    },
  },

  // ============ LOGIN PAGE ============
  login: {
    title: {
      en: 'Sign in', ru: 'Вход', fr: 'Connexion', de: 'Anmelden', es: 'Iniciar sesión',
      pt: 'Entrar', pl: 'Zaloguj się', zh: '登录', hi: 'साइन इन', ar: 'تسجيل الدخول'
    },
    email: {
      en: 'Email', ru: 'Email', fr: 'Email', de: 'E-Mail', es: 'Correo electrónico',
      pt: 'Email', pl: 'Email', zh: '邮箱', hi: 'ईमेल', ar: 'البريد الإلكتروني'
    },
    password: {
      en: 'Password', ru: 'Пароль', fr: 'Mot de passe', de: 'Passwort', es: 'Contraseña',
      pt: 'Senha', pl: 'Hasło', zh: '密码', hi: 'पासवर्ड', ar: 'كلمة المرور'
    },
    demoAccess: {
      en: 'Demo Access', ru: 'Демо доступ', fr: 'Accès démo',
      de: 'Demo-Zugang', es: 'Acceso demo', pt: 'Acesso demo',
      pl: 'Dostęp demo', zh: '演示访问', hi: 'डेमो एक्सेस',
      ar: 'وصول تجريبي'
    },
    oneClick: {
      en: 'One click to explore the app', ru: 'Один клик для доступа к приложению', fr: 'Un clic pour explorer l\'app',
      de: 'Ein Klick zum Erkunden der App', es: 'Un clic para explorar la app', pt: 'Um clique para explorar o app',
      pl: 'Jedno kliknięcie, aby poznać aplikację', zh: '一键探索应用', hi: 'ऐप एक्सप्लोर करने के लिए एक क्लिक',
      ar: 'نقرة واحدة لاستكشاف التطبيق'
    },
    noAccount: {
      en: 'Don\'t have an account?', ru: 'Нет аккаунта?', fr: 'Pas de compte?', de: 'Kein Konto?',
      es: '¿No tienes cuenta?', pt: 'Não tem conta?', pl: 'Nie masz konta?', zh: '没有账户？',
      hi: 'खाता नहीं है?', ar: 'ليس لديك حساب؟'
    },
    signUp: {
      en: 'Sign up', ru: 'Регистрация', fr: 'S\'inscrire', de: 'Registrieren', es: 'Registrarse',
      pt: 'Cadastrar', pl: 'Zarejestruj się', zh: '注册', hi: 'साइन अप', ar: 'اشترك'
    },
  },

  // ============ LANGUAGE NAMES (for dynamic button) ============
  langNames: {
    en: {
      en: 'English', ru: 'Английский', fr: 'Anglais', de: 'Englisch', es: 'Inglés',
      pt: 'Inglês', pl: 'Angielski', zh: '英语', hi: 'अंग्रेज़ी', ar: 'الإنجليزية'
    },
    ru: {
      en: 'Russian', ru: 'Русский', fr: 'Russe', de: 'Russisch', es: 'Ruso',
      pt: 'Russo', pl: 'Rosyjski', zh: '俄语', hi: 'रूसी', ar: 'الروسية'
    },
    fr: {
      en: 'French', ru: 'Французский', fr: 'Français', de: 'Französisch', es: 'Francés',
      pt: 'Francês', pl: 'Francuski', zh: '法语', hi: 'फ़्रेंच', ar: 'الفرنسية'
    },
    de: {
      en: 'German', ru: 'Немецкий', fr: 'Allemand', de: 'Deutsch', es: 'Alemán',
      pt: 'Alemão', pl: 'Niemiecki', zh: '德语', hi: 'जर्मन', ar: 'الألمانية'
    },
    es: {
      en: 'Spanish', ru: 'Испанский', fr: 'Espagnol', de: 'Spanisch', es: 'Español',
      pt: 'Espanhol', pl: 'Hiszpański', zh: '西班牙语', hi: 'स्पेनिश', ar: 'الإسبانية'
    },
    pt: {
      en: 'Portuguese', ru: 'Португальский', fr: 'Portugais', de: 'Portugiesisch', es: 'Portugués',
      pt: 'Português', pl: 'Portugalski', zh: '葡萄牙语', hi: 'पुर्तगाली', ar: 'البرتغالية'
    },
    pl: {
      en: 'Polish', ru: 'Польский', fr: 'Polonais', de: 'Polnisch', es: 'Polaco',
      pt: 'Polonês', pl: 'Polski', zh: '波兰语', hi: 'पोलिश', ar: 'البولندية'
    },
    zh: {
      en: 'Chinese', ru: 'Китайский', fr: 'Chinois', de: 'Chinesisch', es: 'Chino',
      pt: 'Chinês', pl: 'Chiński', zh: '中文', hi: 'चीनी', ar: 'الصينية'
    },
    hi: {
      en: 'Hindi', ru: 'Хинди', fr: 'Hindi', de: 'Hindi', es: 'Hindi',
      pt: 'Hindi', pl: 'Hindi', zh: '印地语', hi: 'हिन्दी', ar: 'الهندية'
    },
    ar: {
      en: 'Arabic', ru: 'Арабский', fr: 'Arabe', de: 'Arabisch', es: 'Árabe',
      pt: 'Árabe', pl: 'Arabski', zh: '阿拉伯语', hi: 'अरबी', ar: 'العربية'
    },
  },
}

// Helper function to get translation
export function t(key, uiLang = 'en', params = {}) {
  const keys = key.split('.')
  let value = translations

  for (const k of keys) {
    value = value?.[k]
    if (!value) return key // fallback to key if not found
  }

  let text = value[uiLang] || value['en'] || key

  // Replace params like {lang}
  for (const [param, val] of Object.entries(params)) {
    text = text.replace(`{${param}}`, val)
  }

  return text
}

// Get language name in current UI language
export function getLangName(langCode, uiLang = 'en') {
  return translations.langNames[langCode]?.[uiLang] || langCode
}
