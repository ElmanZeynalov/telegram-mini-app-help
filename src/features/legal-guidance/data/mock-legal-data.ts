import type { LegalGuidanceData } from "../types"

export const mockLegalData: LegalGuidanceData = {
  version: "1.0.0",
  exportedAt: "2024-01-15T10:00:00Z",
  languages: [
    { code: "az", name: "Azerbaijani", nativeName: "Azərbaycan" },
    { code: "ru", name: "Russian", nativeName: "Русский" },
    { code: "en", name: "English", nativeName: "English" },
  ],
  categories: [
    { id: "cat-1", name: { az: "Ailə hüququ", ru: "Семейное право", en: "Family Law" }, createdAt: "2024-01-01" },
    { id: "cat-2", name: { az: "Əmək hüququ", ru: "Трудовое право", en: "Labor Law" }, createdAt: "2024-01-01" },
    {
      id: "cat-3",
      name: { az: "Mülkiyyət hüququ", ru: "Имущественное право", en: "Property Law" },
      createdAt: "2024-01-01",
    },
    {
      id: "cat-4",
      name: { az: "Vərəsəlik hüququ", ru: "Наследственное право", en: "Inheritance Law" },
      createdAt: "2024-01-01",
    },
    {
      id: "cat-5",
      name: { az: "İstehlakçı hüquqları", ru: "Права потребителей", en: "Consumer Rights" },
      createdAt: "2024-01-01",
    },
    {
      id: "cat-6",
      name: { az: "Sosial müdafiə", ru: "Социальная защита", en: "Social Protection" },
      createdAt: "2024-01-01",
    },
    { id: "cat-7", name: { az: "Mənzil hüququ", ru: "Жилищное право", en: "Housing Law" }, createdAt: "2024-01-01" },
    { id: "cat-8", name: { az: "Cinayət hüququ", ru: "Уголовное право", en: "Criminal Law" }, createdAt: "2024-01-01" },
    {
      id: "cat-9",
      name: { az: "İnzibati hüquq", ru: "Административное право", en: "Administrative Law" },
      createdAt: "2024-01-01",
    },
    { id: "cat-10", name: { az: "Vergi hüququ", ru: "Налоговое право", en: "Tax Law" }, createdAt: "2024-01-01" },
    { id: "cat-11", name: { az: "Tibbi hüquq", ru: "Медицинское право", en: "Medical Law" }, createdAt: "2024-01-01" },
    {
      id: "cat-12",
      name: { az: "Təhsil hüququ", ru: "Образовательное право", en: "Education Law" },
      createdAt: "2024-01-01",
    },
    {
      id: "cat-13",
      name: { az: "Miqrasiya hüququ", ru: "Миграционное право", en: "Migration Law" },
      createdAt: "2024-01-01",
    },
    {
      id: "cat-14",
      name: { az: "Əqli mülkiyyət", ru: "Интеллектуальная собственность", en: "Intellectual Property" },
      createdAt: "2024-01-01",
    },
    { id: "cat-15", name: { az: "Biznes hüququ", ru: "Бизнес право", en: "Business Law" }, createdAt: "2024-01-01" },
    {
      id: "cat-16",
      name: { az: "Ekoloji hüquq", ru: "Экологическое право", en: "Environmental Law" },
      createdAt: "2024-01-01",
    },
  ],
  questions: [
    {
      id: "q-family-root",
      categoryId: "cat-1",
      question: { az: "Ailə hüququ", ru: "Семейное право", en: "Family Law" },
      createdAt: "2024-01-01",
      subQuestions: [
        {
          id: "q-1-1",
          question: {
            az: "Boşanma prosesi necə həyata keçirilir və hansı sənədlər tələb olunur?",
            ru: "Как осуществляется процесс развода и какие документы требуются?",
            en: "How is the divorce process carried out and what documents are required?",
          },
          answer: {
            az: "Boşanma prosesi aşağıdakı addımlardan ibarətdir:\n\n1. **Ərizənin verilməsi**: Məhkəməyə və ya VÖEN-ə ərizə təqdim edilir\n2. **Sənədlərin hazırlanması**: Nikah şəhadətnaməsi, şəxsiyyət vəsiqəsi, uşaqların doğum haqqında şəhadətnamələri\n3. **Məhkəmə prosesi**: Tərəflərin dinlənilməsi və qərarın qəbulu\n\nProses adətən 1-3 ay çəkir.",
            ru: "Процесс развода состоит из следующих этапов:\n\n1. **Подача заявления**: Заявление подается в суд или ЗАГС\n2. **Подготовка документов**: Свидетельство о браке, удостоверение личности, свидетельства о рождении детей\n3. **Судебный процесс**: Заслушивание сторон и принятие решения\n\nПроцесс обычно занимает 1-3 месяца.",
            en: "The divorce process consists of the following steps:\n\n1. **Filing an application**: An application is submitted to the court or registry office\n2. **Document preparation**: Marriage certificate, ID, children's birth certificates\n3. **Court process**: Hearing of parties and decision making\n\nThe process usually takes 1-3 months.",
          },
          createdAt: "2024-01-01",
        },
        {
          id: "q-1-2",
          question: {
            az: "Uşaq üzərində qəyyumluq hüququ necə müəyyən edilir?",
            ru: "Как определяется право опеки над ребенком?",
            en: "How is child custody determined?",
          },
          createdAt: "2024-01-01",
          subQuestions: [
            {
              id: "q-1-2-1",
              question: {
                az: "Valideynlərin hər ikisi uşağın qəyyumluğunu istəyirsə nə etməli?",
                ru: "Что делать, если оба родителя хотят опеку над ребенком?",
                en: "What to do if both parents want custody of the child?",
              },
              answer: {
                az: "Bu halda məhkəmə aşağıdakı amilləri nəzərə alır:\n\n- Uşağın yaşı və istəkləri\n- Valideynlərin maddi vəziyyəti\n- Yaşayış şəraiti\n- Uşağın məktəbi və sosial əlaqələri\n\nMəhkəmə uşağın **ən yaxşı maraqlarını** əsas götürür.",
                ru: "В этом случае суд учитывает следующие факторы:\n\n- Возраст и пожелания ребенка\n- Материальное положение родителей\n- Жилищные условия\n- Школа ребенка и социальные связи\n\nСуд руководствуется **наилучшими интересами ребенка**.",
                en: "In this case, the court considers the following factors:\n\n- Child's age and wishes\n- Parents' financial situation\n- Living conditions\n- Child's school and social connections\n\nThe court is guided by the **best interests of the child**.",
              },
              createdAt: "2024-01-01",
            },
            {
              id: "q-1-2-2",
              question: {
                az: "Bir valideyn xaricdə yaşayırsa qəyyumluq necə həll edilir?",
                ru: "Как решается опека, если один из родителей живет за границей?",
                en: "How is custody resolved if one parent lives abroad?",
              },
              answer: {
                az: "Beynəlxalq qəyyumluq məsələləri mürəkkəbdir. Adətən:\n\n1. Uşağın daimi yaşayış yeri əsas götürülür\n2. Haaqa Konvensiyası tətbiq oluna bilər\n3. Hər iki ölkənin qanunları nəzərə alınır",
                ru: "Международные вопросы опеки сложны. Обычно:\n\n1. Основывается на постоянном месте жительства ребенка\n2. Может применяться Гаагская конвенция\n3. Учитываются законы обеих стран",
                en: "International custody issues are complex. Usually:\n\n1. Based on child's permanent residence\n2. Hague Convention may apply\n3. Laws of both countries are considered",
              },
              createdAt: "2024-01-01",
            },
          ],
        },
        {
          id: "q-1-3",
          question: {
            az: "Ailə zorakılığı ilə üzləşdikdə hansı addımları atmalıyam?",
            ru: "Какие шаги предпринять при столкновении с домашним насилием?",
            en: "What steps should I take when facing domestic violence?",
          },
          answer: {
            az: "Ailə zorakılığı ilə üzləşdikdə:\n\n1. **Təhlükəsizlik**: Təhlükəsiz yerə gedin\n2. **Polis**: 102 nömrəsinə zəng edin\n3. **Tibbi yardım**: Xəsarətləri sənədləşdirin\n4. **Hüquqi yardım**: Məhdudlaşdırıcı order üçün müraciət edin\n\n**Qaynar xətt**: 860 (pulsuz)",
            ru: "При столкновении с домашним насилием:\n\n1. **Безопасность**: Переместитесь в безопасное место\n2. **Полиция**: Позвоните 102\n3. **Медицинская помощь**: Задокументируйте травмы\n4. **Юридическая помощь**: Подайте заявление на охранный ордер\n\n**Горячая линия**: 860 (бесплатно)",
            en: "When facing domestic violence:\n\n1. **Safety**: Go to a safe place\n2. **Police**: Call 102\n3. **Medical help**: Document injuries\n4. **Legal help**: Apply for a restraining order\n\n**Hotline**: 860 (free)",
          },
          createdAt: "2024-01-01",
        },
      ],
    },
    {
      id: "q-labor-root",
      categoryId: "cat-2",
      question: { az: "Əmək hüququ", ru: "Трудовое право", en: "Labor Law" },
      createdAt: "2024-01-01",
      subQuestions: [
        {
          id: "q-2-1",
          question: {
            az: "İşdən çıxarılma zamanı hansı hüquqlarım var?",
            ru: "Какие у меня права при увольнении?",
            en: "What are my rights when being dismissed?",
          },
          answer: {
            az: "İşdən çıxarılma zamanı hüquqlarınız:\n\n- **Xəbərdarlıq**: Ən azı 2 həftə əvvəl\n- **Kompensasiya**: İşlənmiş illərə görə\n- **Məzuniyyət haqqı**: İstifadə olunmamış günlər üçün\n- **Arayış**: İş stajı haqqında",
            ru: "Ваши права при увольнении:\n\n- **Предупреждение**: Минимум за 2 недели\n- **Компенсация**: За отработанные годы\n- **Отпускные**: За неиспользованные дни\n- **Справка**: О трудовом стаже",
            en: "Your rights when being dismissed:\n\n- **Notice**: At least 2 weeks in advance\n- **Compensation**: For years worked\n- **Leave pay**: For unused days\n- **Reference**: About work experience",
          },
          createdAt: "2024-01-01",
        },
        {
          id: "q-2-2",
          question: {
            az: "Hamiləlik dövründə işdən çıxarıla bilərəmmi?",
            ru: "Могут ли меня уволить во время беременности?",
            en: "Can I be dismissed during pregnancy?",
          },
          answer: {
            az: "**Xeyr**, hamilə qadınları işdən çıxarmaq qanunla qadağandır, yalnız:\n\n- Müəssisə ləğv edildikdə\n- Müddətli müqavilə bitdikdə\n\nBu hüquq uşaq 3 yaşına çatanadək qüvvədədir.",
            ru: "**Нет**, увольнение беременных женщин запрещено законом, кроме случаев:\n\n- Ликвидации предприятия\n- Истечения срочного договора\n\nЭто право действует до достижения ребенком 3 лет.",
            en: "**No**, dismissing pregnant women is prohibited by law, except:\n\n- Company liquidation\n- Fixed-term contract expiration\n\nThis right is valid until the child reaches 3 years old.",
          },
          createdAt: "2024-01-01",
        },
      ],
    },
  ],
}
