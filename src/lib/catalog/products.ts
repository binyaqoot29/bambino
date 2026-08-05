import type { AgeGroup, ArtKey, Product, Variant } from "./types";
import {
  BABY_SIZES,
  COLOURS,
  KID_SIZES,
  ONE_SIZE,
  SHOE_SIZES,
  categoryBySlug,
} from "./taxonomy";

/* --------------------------------------------------------------------------
 * Seed catalogue.
 *
 * Hand-written product data standing in for a real PIM / Medusa backend. The
 * shape matches what a commerce API would return, so swapping `getProducts()`
 * in queries.ts for a fetch is the only change needed later.
 * ----------------------------------------------------------------------- */

type Pair = [en: string, ar: string];

type Seed = {
  h: string;
  n: Pair;
  s: Pair;
  d: Pair;
  det: Pair[];
  care?: Pair;
  cat: string;
  price: number;
  was?: number;
  art: ArtKey;
  cols: (keyof typeof COLOURS)[];
  sizes: readonly string[];
  ages?: AgeGroup[];
  rating: number;
  reviews: number;
  daysOld: number;
  featured?: boolean;
  best?: boolean;
};

const ALL_BABY = [...BABY_SIZES];
const BABY_AND_KID = [...BABY_SIZES, ...KID_SIZES];

const CARE_COTTON: Pair = [
  "Machine wash at 30°C with like colours. Do not tumble dry.",
  "غسيل آلي على 30 درجة مع الألوان المشابهة. يُمنع التجفيف بالمجفف.",
];
const CARE_WIPE: Pair = [
  "Wipe the frame with a damp cloth. Fabrics are removable and machine washable at 30°C.",
  "امسح الهيكل بقطعة قماش مبللة. الأقمشة قابلة للفك والغسل الآلي على 30 درجة.",
];

const SEEDS: Seed[] = [
  /* --- Bodysuits ------------------------------------------------------ */
  {
    h: "cloud-cotton-bodysuit-3-pack",
    n: ["Cloud Cotton Bodysuit, 3-Pack", "بادي سوت قطن سحابي، 3 قطع"],
    s: ["Envelope neck, three-popper gusset", "فتحة رقبة مرنة وثلاثة أزرار"],
    d: [
      "Three everyday bodysuits in brushed cotton jersey, cut with an envelope neckline that stretches over the head without a fuss. The three-popper gusset makes changes quick.",
      "ثلاث قطع يومية من جيرسيه القطن الناعم، بفتحة رقبة مرنة تمرّ فوق الرأس بسهولة. الأزرار الثلاثة تجعل التغيير أسرع.",
    ],
    det: [
      ["100% organic cotton jersey, 180gsm", "جيرسيه قطن عضوي 100٪ بوزن 180 غم/م²"],
      ["Envelope neckline for easy dressing", "فتحة رقبة مرنة لسهولة الإلباس"],
      ["OEKO-TEX Standard 100 certified", "حاصل على شهادة OEKO-TEX Standard 100"],
    ],
    care: CARE_COTTON,
    cat: "bodysuits",
    price: 8500,
    art: "bodysuit",
    cols: ["ivory", "mint", "blush"],
    sizes: ALL_BABY,
    rating: 4.8,
    reviews: 214,
    daysOld: 40,
    best: true,
  },
  {
    h: "little-elephant-bodysuit",
    n: ["Little Elephant Bodysuit", "بادي سوت الفيل الصغير"],
    s: ["Our mark, printed small", "شعارنا بطبعة صغيرة"],
    d: [
      "A single Bambino elephant printed on the chest in soft water-based ink. Nothing scratchy on the inside — the label is printed, not sewn.",
      "فيل بامبينو مطبوع على الصدر بحبر مائي ناعم. لا شيء يخدش من الداخل — الملصق مطبوع وليس مخيطاً.",
    ],
    det: [
      ["Water-based print, no plastisol", "طباعة مائية خالية من البلاستيزول"],
      ["Printed care label, no sewn tag", "ملصق عناية مطبوع بدون خياطة"],
      ["Shoulder poppers", "أزرار على الكتف"],
    ],
    care: CARE_COTTON,
    cat: "bodysuits",
    price: 4250,
    was: 5500,
    art: "bodysuit",
    cols: ["orchid", "cloud", "cream"],
    sizes: ALL_BABY,
    rating: 4.6,
    reviews: 88,
    daysOld: 120,
  },
  {
    h: "ribbed-wrap-bodysuit",
    n: ["Ribbed Wrap Bodysuit", "بادي سوت ملفوف مضلّع"],
    s: ["Wraps over, never over the head", "يُلفّ من الأمام دون المرور فوق الرأس"],
    d: [
      "A side-tie wrap that opens completely flat — the easiest first bodysuit for a newborn who doesn't want anything near their face.",
      "تصميم ملفوف بربطة جانبية يُفتح بالكامل — أسهل بادي سوت لحديثي الولادة الذين لا يحبّون ما يقترب من وجوههم.",
    ],
    det: [
      ["2x2 ribbed organic cotton", "قطن عضوي مضلّع 2×2"],
      ["Side ties, opens flat", "ربطات جانبية تُفتح بالكامل"],
      ["Fold-over scratch mitts on 0–3m", "أكمام قابلة للطي لحماية الوجه في مقاس 0–3 أشهر"],
    ],
    care: CARE_COTTON,
    cat: "bodysuits",
    price: 5000,
    art: "bodysuit",
    cols: ["cream", "sage", "blush"],
    sizes: ["newborn", "0-3m", "3-6m", "6-9m"],
    rating: 4.9,
    reviews: 61,
    daysOld: 18,
  },
  {
    h: "long-sleeve-bodysuit-2-pack",
    n: ["Long-Sleeve Bodysuit, 2-Pack", "بادي سوت بأكمام طويلة، قطعتان"],
    s: ["For the aggressive AC", "لمواجهة التكييف القوي"],
    d: [
      "Long sleeves for indoor Kuwait — malls and majlises run cold even in August. Cuffs stay put without digging in.",
      "أكمام طويلة لأجواء الكويت الداخلية — المجمّعات والمجالس باردة حتى في أغسطس. الأساور ثابتة دون ضغط.",
    ],
    det: [
      ["Two per pack", "قطعتان في العبوة"],
      ["Ribbed cuffs that hold shape", "أساور مضلّعة تحافظ على شكلها"],
      ["Envelope neckline", "فتحة رقبة مرنة"],
    ],
    care: CARE_COTTON,
    cat: "bodysuits",
    price: 6750,
    art: "bodysuit",
    cols: ["navy", "ivory", "mint"],
    sizes: ALL_BABY,
    rating: 4.7,
    reviews: 132,
    daysOld: 75,
  },

  /* --- Sleepsuits ----------------------------------------------------- */
  {
    h: "starlit-sleepsuit",
    n: ["Starlit Sleepsuit", "بيجامة ستارليت"],
    s: ["Integrated feet, no lost socks", "بأقدام مدمجة — لا جوارب ضائعة"],
    d: [
      "A full-length sleepsuit with enclosed feet and a two-way zip, so a night change doesn't mean undressing everything.",
      "بيجامة كاملة بأقدام مغلقة وسحّاب باتجاهين، ليكون تغيير الحفاض ليلاً دون خلع كل شيء.",
    ],
    det: [
      ["Two-way YKK zip with chin guard", "سحّاب YKK باتجاهين مع واقٍ للذقن"],
      ["Enclosed non-slip feet", "أقدام مغلقة مانعة للانزلاق"],
      ["Fold-over cuffs", "أساور قابلة للطي"],
    ],
    care: CARE_COTTON,
    cat: "sleepsuits",
    price: 6500,
    art: "sleepsuit",
    cols: ["cloud", "plum", "sage"],
    sizes: ALL_BABY,
    rating: 4.8,
    reviews: 176,
    daysOld: 30,
  },
  {
    h: "zip-through-sleepsuit-2-pack",
    n: ["Zip-Through Sleepsuit, 2-Pack", "بيجامة بسحّاب، قطعتان"],
    s: ["The 3am pack", "عدّة الثالثة فجراً"],
    d: [
      "Two sleepsuits, both zipped, both with fold-over feet. Bought as a pair because one is always in the wash.",
      "بيجامتان بسحّاب وأقدام قابلة للطي. تُشترى كزوج لأن واحدة دائماً في الغسيل.",
    ],
    det: [
      ["Two per pack", "قطعتان في العبوة"],
      ["Fold-over feet grow with them", "أقدام قابلة للطي تنمو معهم"],
      ["Zip guard at the chin", "واقٍ للسحّاب عند الذقن"],
    ],
    care: CARE_COTTON,
    cat: "sleepsuits",
    price: 9750,
    art: "sleepsuit",
    cols: ["mint", "ivory"],
    sizes: ALL_BABY,
    rating: 4.7,
    reviews: 203,
    daysOld: 95,
    best: true,
  },
  {
    h: "muslin-pyjama-set",
    n: ["Muslin Pyjama Set", "طقم بيجامة موسلين"],
    s: ["Double-gauze, gets softer", "شاش مزدوج يزداد نعومة"],
    d: [
      "A two-piece set in double-gauze muslin that breathes through a Kuwaiti summer and softens with every wash.",
      "طقم من قطعتين بقماش الموسلين المزدوج يسمح بمرور الهواء في صيف الكويت ويزداد نعومة مع كل غسلة.",
    ],
    det: [
      ["Double-gauze cotton muslin", "موسلين قطني بطبقتين"],
      ["Elasticated waist, no drawstring", "خصر مطاطي بدون رباط"],
      ["Two pieces", "قطعتان"],
    ],
    care: CARE_COTTON,
    cat: "sleepsuits",
    price: 11000,
    art: "sleepsuit",
    cols: ["blush", "cloud", "sun"],
    sizes: [...KID_SIZES],
    rating: 4.9,
    reviews: 47,
    daysOld: 12,
    featured: true,
  },
  {
    h: "footed-velour-sleepsuit",
    n: ["Footed Velour Sleepsuit", "بيجامة مخمل بأقدام"],
    s: ["Winter weight, brushed inside", "وزن شتوي مبطّن من الداخل"],
    d: [
      "Brushed velour for the six weeks of Kuwaiti winter that genuinely need it. Poppers down the front and both legs.",
      "مخمل مفرّش لأسابيع الشتاء الكويتي القليلة التي تحتاجه فعلاً. أزرار على الأمام وعلى الساقين.",
    ],
    det: [
      ["Brushed velour, 240gsm", "مخمل مفرّش بوزن 240 غم/م²"],
      ["Poppers front and both legs", "أزرار أمامية وعلى الساقين"],
      ["Non-slip feet", "أقدام مانعة للانزلاق"],
    ],
    care: CARE_COTTON,
    cat: "sleepsuits",
    price: 7250,
    was: 9000,
    art: "sleepsuit",
    cols: ["plum", "grey"],
    sizes: ALL_BABY,
    rating: 4.5,
    reviews: 66,
    daysOld: 210,
  },

  /* --- Dresses -------------------------------------------------------- */
  {
    h: "tiered-twirl-dress",
    n: ["Tiered Twirl Dress", "فستان بطبقات دوّارة"],
    s: ["Three tiers, maximum spin", "ثلاث طبقات لأقصى دوران"],
    d: [
      "Three gathered tiers in washed cotton poplin. Tested by the only metric that matters: how well it spins.",
      "ثلاث طبقات مكشكشة من البوبلين القطني المغسول. مختبَرة بالمعيار الوحيد المهم: مدى جمال دورانها.",
    ],
    det: [
      ["Washed cotton poplin", "بوبلين قطني مغسول"],
      ["Full button placket at the back", "صف أزرار كامل من الخلف"],
      ["Lined bodice", "صدرية مبطّنة"],
    ],
    care: CARE_COTTON,
    cat: "dresses",
    price: 12500,
    art: "dress",
    cols: ["orchid", "cream", "sage"],
    sizes: BABY_AND_KID,
    rating: 4.9,
    reviews: 118,
    daysOld: 8,
    featured: true,
  },
  {
    h: "broderie-summer-dress",
    n: ["Broderie Summer Dress", "فستان صيفي مطرّز"],
    s: ["Cotton broderie anglaise", "تطريز إنجليزي قطني"],
    d: [
      "Openwork cotton broderie with a scalloped hem, fully lined so nothing shows through in bright light.",
      "تطريز قطني مفتوح بحاشية مموّجة، مبطّن بالكامل حتى لا يظهر شيء تحت الضوء القوي.",
    ],
    det: [
      ["Cotton broderie anglaise", "تطريز إنجليزي قطني"],
      ["Fully lined", "بطانة كاملة"],
      ["Scalloped hem", "حاشية مموّجة"],
    ],
    care: CARE_COTTON,
    cat: "dresses",
    price: 10500,
    art: "dress",
    cols: ["ivory", "blush"],
    sizes: BABY_AND_KID,
    rating: 4.7,
    reviews: 74,
    daysOld: 55,
  },
  {
    h: "jersey-pinafore-set",
    n: ["Jersey Pinafore & Tee Set", "طقم مريلة وتيشيرت جيرسيه"],
    s: ["Two pieces, one decision", "قطعتان بقرار واحد"],
    d: [
      "A soft jersey pinafore with adjustable straps over a plain long-sleeve tee. Buttons at the shoulder so it goes on without a struggle.",
      "مريلة جيرسيه ناعمة بحمّالات قابلة للتعديل فوق تيشيرت بأكمام طويلة. أزرار على الكتف لإلباس سهل.",
    ],
    det: [
      ["Two pieces included", "قطعتان في الطقم"],
      ["Adjustable button straps", "حمّالات بأزرار قابلة للتعديل"],
      ["Front pocket", "جيب أمامي"],
    ],
    care: CARE_COTTON,
    cat: "dresses",
    price: 9500,
    art: "dress",
    cols: ["navy", "clay", "mint"],
    sizes: [...KID_SIZES],
    rating: 4.6,
    reviews: 39,
    daysOld: 66,
  },
  {
    h: "tulle-party-dress",
    n: ["Tulle Party Dress", "فستان تُل للمناسبات"],
    s: ["Eid, birthdays, and the school photo", "للعيد وأعياد الميلاد وصورة المدرسة"],
    d: [
      "Layered tulle over a cotton lining, with a satin sash that ties at the back. The lining is cotton, so it survives a whole party.",
      "طبقات من التُل فوق بطانة قطنية، مع حزام ساتان يُربط من الخلف. البطانة قطنية لتتحمّل الحفلة كاملة.",
    ],
    det: [
      ["Cotton-lined, not polyester", "بطانة قطنية وليست بوليستر"],
      ["Removable satin sash", "حزام ساتان قابل للفصل"],
      ["Concealed back zip", "سحّاب خلفي مخفي"],
    ],
    cat: "dresses",
    price: 15000,
    was: 19500,
    art: "dress",
    cols: ["orchid", "ivory"],
    sizes: [...KID_SIZES],
    rating: 4.8,
    reviews: 92,
    daysOld: 140,
  },

  /* --- Tops ----------------------------------------------------------- */
  {
    h: "everyday-tee-3-pack",
    n: ["Everyday Tee, 3-Pack", "تيشيرت يومي، 3 قطع"],
    s: ["The ones that get worn out", "القطع التي تُلبس حتى تبلى"],
    d: [
      "Three plain tees in mid-weight cotton. Nothing clever — just the shape you reach for every morning.",
      "ثلاثة تيشيرتات سادة من قطن متوسط الوزن. لا شيء معقّد — فقط القصّة التي تختارها كل صباح.",
    ],
    det: [
      ["Three per pack", "ثلاث قطع في العبوة"],
      ["Ribbed neck that keeps its shape", "رقبة مضلّعة تحافظ على شكلها"],
      ["Mid-weight 160gsm cotton", "قطن متوسط الوزن 160 غم/م²"],
    ],
    care: CARE_COTTON,
    cat: "tops",
    price: 7500,
    art: "tee",
    cols: ["ivory", "mint", "orchid"],
    sizes: BABY_AND_KID,
    rating: 4.7,
    reviews: 288,
    daysOld: 100,
    best: true,
  },
  {
    h: "striped-long-sleeve-tee",
    n: ["Striped Long-Sleeve Tee", "تيشيرت مخطّط بأكمام طويلة"],
    s: ["Stripes hide everything", "الخطوط تخفي كل شيء"],
    d: [
      "A classic breton stripe in soft cotton jersey — practical camouflage for whatever lunch turns into.",
      "خطوط بريتون كلاسيكية من جيرسيه قطني ناعم — تمويه عملي لما قد يتركه الغداء.",
    ],
    det: [
      ["Yarn-dyed stripes, won't fade", "خطوط مصبوغة بالخيط لا تبهت"],
      ["Shoulder poppers up to 18–24m", "أزرار كتف حتى مقاس 18–24 شهراً"],
      ["Soft cotton jersey", "جيرسيه قطني ناعم"],
    ],
    care: CARE_COTTON,
    cat: "tops",
    price: 4750,
    art: "tee",
    cols: ["navy", "plum"],
    sizes: BABY_AND_KID,
    rating: 4.5,
    reviews: 104,
    daysOld: 160,
  },
  {
    h: "quilted-sweatshirt",
    n: ["Quilted Sweatshirt", "سويت شيرت مبطّن"],
    s: ["Light layer, real warmth", "طبقة خفيفة بدفء حقيقي"],
    d: [
      "A lightly quilted sweatshirt that packs down small — the layer that lives in the changing bag from November to February.",
      "سويت شيرت مبطّن خفيف يُطوى بحجم صغير — الطبقة التي تبقى في حقيبة التغيير من نوفمبر إلى فبراير.",
    ],
    det: [
      ["Diamond-quilted jersey", "جيرسيه مبطّن بنقشة معيّنات"],
      ["Two front pockets", "جيبان أماميان"],
      ["Ribbed cuffs and hem", "أساور وحاشية مضلّعة"],
    ],
    care: CARE_COTTON,
    cat: "tops",
    price: 8750,
    art: "tee",
    cols: ["sage", "grey", "blush"],
    sizes: BABY_AND_KID,
    rating: 4.6,
    reviews: 58,
    daysOld: 48,
  },
  {
    h: "sun-safe-rash-top",
    n: ["Sun-Safe Rash Top UPF 50+", "تيشيرت واقٍ من الشمس UPF 50+"],
    s: ["For the chalet and the pool", "للشاليه والمسبح"],
    d: [
      "UPF 50+ across the whole garment, with flatlock seams that don't rub under a wet suit. Quick-drying and chlorine-resistant.",
      "حماية UPF 50+ على كامل القطعة، مع خياطة مسطّحة لا تسبّب الاحتكاك تحت الملابس المبللة. سريع الجفاف ومقاوم للكلور.",
    ],
    det: [
      ["UPF 50+ certified fabric", "قماش معتمد بحماية UPF 50+"],
      ["Flatlock seams", "خياطة مسطّحة"],
      ["Chlorine and salt resistant", "مقاوم للكلور والملح"],
    ],
    cat: "tops",
    price: 6500,
    art: "tee",
    cols: ["mint", "sun", "navy"],
    sizes: BABY_AND_KID,
    rating: 4.8,
    reviews: 143,
    daysOld: 22,
    featured: true,
  },

  /* --- Shoes ---------------------------------------------------------- */
  {
    h: "first-steps-soft-booties",
    n: ["First Steps Soft Booties", "خفاف الخطوات الأولى"],
    s: ["Barefoot feel, some protection", "إحساس القدم الحافية مع بعض الحماية"],
    d: [
      "Suede soles thin enough to feel the floor, with an elasticated ankle that actually stays on.",
      "نعال جلد شمواه رقيقة بما يكفي للإحساس بالأرض، مع كاحل مطاطي يبقى في مكانه فعلاً.",
    ],
    det: [
      ["Soft suede sole", "نعل من جلد الشمواه الناعم"],
      ["Elasticated ankle", "كاحل مطاطي"],
      ["Leather upper", "وجه جلدي"],
    ],
    cat: "shoes",
    price: 6000,
    art: "booties",
    cols: ["cream", "orchid", "navy"],
    sizes: SHOE_SIZES,
    ages: ["6-12m", "1-2y"],
    rating: 4.7,
    reviews: 81,
    daysOld: 35,
  },
  {
    h: "canvas-summer-shoes",
    n: ["Canvas Summer Shoes", "أحذية صيفية من الكانفا"],
    s: ["Rip-tab, no laces to untie", "لاصق بدون أربطة تنحلّ"],
    d: [
      "Breathable canvas with a wide toe box and a single rip-tab, so they can do it themselves.",
      "كانفا يسمح بمرور الهواء مع مقدمة واسعة ولاصق واحد، ليستطيعوا لبسه بأنفسهم.",
    ],
    det: [
      ["Breathable cotton canvas", "كانفا قطني يسمح بمرور الهواء"],
      ["Wide toe box", "مقدمة واسعة"],
      ["Removable insole", "نعل داخلي قابل للإزالة"],
    ],
    cat: "shoes",
    price: 9500,
    art: "booties",
    cols: ["ivory", "sage", "blush"],
    sizes: SHOE_SIZES,
    ages: ["1-2y", "2-4y"],
    rating: 4.4,
    reviews: 52,
    daysOld: 88,
  },
  {
    h: "knitted-pram-shoes",
    n: ["Knitted Pram Shoes", "أحذية كروشيه للعربة"],
    s: ["For feet that don't walk yet", "لأقدام لم تمشِ بعد"],
    d: [
      "Soft knitted booties for pram and car seat, with a ribbed ankle that keeps them on through a kicking session.",
      "خفاف محبوكة ناعمة للعربة ومقعد السيارة، بكاحل مضلّع يبقيها ثابتة رغم الركل.",
    ],
    det: [
      ["Cotton-blend knit", "حياكة من مزيج القطن"],
      ["Ribbed ankle", "كاحل مضلّع"],
      ["No hard sole", "بدون نعل صلب"],
    ],
    care: CARE_COTTON,
    cat: "shoes",
    price: 4500,
    was: 6000,
    art: "booties",
    cols: ["cloud", "cream"],
    sizes: ["17", "18", "19"],
    ages: ["newborn", "0-6m"],
    rating: 4.6,
    reviews: 37,
    daysOld: 175,
  },

  /* --- Prams ---------------------------------------------------------- */
  {
    h: "breeze-lightweight-stroller",
    n: ["Breeze Lightweight Stroller", "عربة بريز الخفيفة"],
    s: ["6.2kg, one-hand fold", "6.2 كغم وطيّ بيد واحدة"],
    d: [
      "A 6.2kg aluminium frame that folds one-handed and stands on its own — designed for lifts, boots and the walk from the car park.",
      "هيكل ألمنيوم بوزن 6.2 كغم يُطوى بيد واحدة ويقف بمفرده — مصمّم للمصاعد وصندوق السيارة والمشي من الموقف.",
    ],
    det: [
      ["6.2kg aluminium frame", "هيكل ألمنيوم بوزن 6.2 كغم"],
      ["One-hand fold, free-standing", "طيّ بيد واحدة ويقف بمفرده"],
      ["Extendable UPF 50+ hood", "مظلّة قابلة للتمديد بحماية UPF 50+"],
      ["Suitable from 6 months to 22kg", "مناسبة من 6 أشهر حتى 22 كغم"],
    ],
    care: CARE_WIPE,
    cat: "prams",
    price: 62000,
    art: "stroller",
    cols: ["plum", "navy", "grey"],
    sizes: ONE_SIZE,
    ages: ["6-12m", "1-2y", "2-4y"],
    rating: 4.8,
    reviews: 312,
    daysOld: 25,
    featured: true,
    best: true,
  },
  {
    h: "voyage-3-in-1-travel-system",
    n: ["Voyage 3-in-1 Travel System", "نظام فويج 3 في 1"],
    s: ["Carrycot, seat and car seat", "سرير محمول ومقعد ومقعد سيارة"],
    d: [
      "Everything from the first day: a lie-flat carrycot, a reversible seat unit and an i-Size infant carrier that clicks onto the same frame.",
      "كل ما تحتاجه من اليوم الأول: سرير محمول مسطّح، ومقعد قابل للعكس، ومقعد سيارة i-Size يُثبَّت على الهيكل نفسه.",
    ],
    det: [
      ["Lie-flat carrycot from birth", "سرير محمول مسطّح من الولادة"],
      ["Reversible seat, parent or world facing", "مقعد قابل للعكس نحو الوالد أو الأمام"],
      ["i-Size infant carrier included", "يشمل مقعد سيارة i-Size"],
      ["All-wheel suspension", "نظام تعليق لكل العجلات"],
    ],
    care: CARE_WIPE,
    cat: "prams",
    price: 185000,
    art: "stroller",
    cols: ["plum", "grey"],
    sizes: ONE_SIZE,
    ages: ["newborn", "0-6m", "6-12m", "1-2y"],
    rating: 4.9,
    reviews: 96,
    daysOld: 60,
    featured: true,
  },
  {
    h: "city-compact-buggy",
    n: ["City Compact Buggy", "عربة سيتي المدمجة"],
    s: ["Cabin-bag fold", "تُطوى بحجم حقيبة الطائرة"],
    d: [
      "Folds down to overhead-locker size in one motion. The one that lives in the boot permanently.",
      "تُطوى بحركة واحدة إلى حجم مقصورة الطائرة العلوية. العربة التي تبقى في صندوق السيارة دائماً.",
    ],
    det: [
      ["Folds to 55 × 40 × 20cm", "تُطوى إلى 55 × 40 × 20 سم"],
      ["Carry strap included", "حزام حمل مرفق"],
      ["Suitable from 6 months to 15kg", "مناسبة من 6 أشهر حتى 15 كغم"],
    ],
    care: CARE_WIPE,
    cat: "prams",
    price: 45000,
    was: 55000,
    art: "stroller",
    cols: ["navy", "orchid"],
    sizes: ONE_SIZE,
    ages: ["6-12m", "1-2y", "2-4y"],
    rating: 4.5,
    reviews: 187,
    daysOld: 130,
  },
  {
    h: "duo-twin-pram",
    n: ["Duo Side-by-Side Twin Pram", "عربة ديو للتوأم جنباً إلى جنب"],
    s: ["Still fits through a doorway", "تمرّ من باب عادي"],
    d: [
      "Two independently reclining seats in a frame narrow enough for a standard doorway — 74cm across.",
      "مقعدان يميلان بشكل مستقل ضمن هيكل ضيّق يمرّ من باب عادي — بعرض 74 سم.",
    ],
    det: [
      ["74cm total width", "عرض إجمالي 74 سم"],
      ["Independently reclining seats", "مقعدان يميلان بشكل مستقل"],
      ["Suitable from birth with carrycots", "مناسبة من الولادة مع الأسرّة المحمولة"],
    ],
    care: CARE_WIPE,
    cat: "prams",
    price: 145000,
    art: "stroller",
    cols: ["grey", "plum"],
    sizes: ONE_SIZE,
    ages: ["newborn", "0-6m", "6-12m", "1-2y"],
    rating: 4.6,
    reviews: 43,
    daysOld: 150,
  },

  /* --- Car seats ------------------------------------------------------ */
  {
    h: "cocoon-i-size-infant-carrier",
    n: ["Cocoon i-Size Infant Carrier", "مقعد كوكون i-Size للرضّع"],
    s: ["40–87cm, rearward facing", "40–87 سم، باتجاه الخلف"],
    d: [
      "An i-Size rated infant carrier with side-impact pods and a newborn insert, clicking straight onto the Voyage and Breeze frames.",
      "مقعد رضّع معتمد i-Size مزوّد بوسائد للصدمات الجانبية وحشوة لحديثي الولادة، يُثبَّت مباشرة على هيكلي فويج وبريز.",
    ],
    det: [
      ["ECE R129 (i-Size) approved", "معتمد وفق ECE R129 (i-Size)"],
      ["Side-impact protection pods", "وسائد حماية من الصدمات الجانبية"],
      ["Newborn insert included", "حشوة لحديثي الولادة مرفقة"],
      ["ISOFIX base sold separately", "قاعدة ISOFIX تُباع منفصلة"],
    ],
    care: CARE_WIPE,
    cat: "car-seats",
    price: 78000,
    art: "carseat",
    cols: ["plum", "grey"],
    sizes: ONE_SIZE,
    ages: ["newborn", "0-6m", "6-12m"],
    rating: 4.9,
    reviews: 221,
    daysOld: 45,
    featured: true,
  },
  {
    h: "horizon-360-car-seat",
    n: ["Horizon 360° Rotating Car Seat", "مقعد هورايزن الدوّار 360°"],
    s: ["Turns to the door to load", "يدور نحو الباب لسهولة الإجلاس"],
    d: [
      "Rotates to face the door so you're not lifting at an angle, then locks rearward or forward facing from 40cm to 105cm.",
      "يدور نحو باب السيارة لتتجنّب الرفع بزاوية، ثم يُثبَّت باتجاه الخلف أو الأمام من 40 إلى 105 سم.",
    ],
    det: [
      ["360° rotation, locks both ways", "دوران 360° مع تثبيت بالاتجاهين"],
      ["ECE R129 (i-Size) approved", "معتمد وفق ECE R129 (i-Size)"],
      ["ISOFIX with support leg", "ISOFIX مع قائم دعم"],
      ["Rearward facing to 105cm", "باتجاه الخلف حتى 105 سم"],
    ],
    care: CARE_WIPE,
    cat: "car-seats",
    price: 135000,
    art: "carseat",
    cols: ["navy", "grey"],
    sizes: ONE_SIZE,
    ages: ["newborn", "0-6m", "6-12m", "1-2y", "2-4y"],
    rating: 4.8,
    reviews: 164,
    daysOld: 70,
    best: true,
  },
  {
    h: "journey-high-back-booster",
    n: ["Journey High-Back Booster", "مقعد جورني المرتفع"],
    s: ["100–150cm, adjusts as they grow", "100–150 سم، يتمدّد مع نموّهم"],
    d: [
      "A high-back booster with an eleven-position headrest and guides that keep the seatbelt off the neck.",
      "مقعد مرتفع بمسند رأس بأحد عشر وضعاً وموجّهات تُبعد حزام الأمان عن الرقبة.",
    ],
    det: [
      ["11-position headrest", "مسند رأس بـ 11 وضعاً"],
      ["ISOFIX connectors", "وصلات ISOFIX"],
      ["Removable washable cover", "غطاء قابل للفك والغسل"],
    ],
    care: CARE_WIPE,
    cat: "car-seats",
    price: 42000,
    was: 52000,
    art: "carseat",
    cols: ["grey", "navy"],
    sizes: ONE_SIZE,
    ages: ["4-6y"],
    rating: 4.5,
    reviews: 78,
    daysOld: 190,
  },

  /* --- Changing bags -------------------------------------------------- */
  {
    h: "everything-changing-backpack",
    n: ["Everything Changing Backpack", "حقيبة ظهر إفري ثينغ للتغيير"],
    s: ["Both shoulders, insulated pocket", "على الكتفين مع جيب معزول"],
    d: [
      "A backpack with a wipe-clean lining, two insulated bottle pockets and a fold-out changing mat that tucks into its own slot.",
      "حقيبة ظهر ببطانة سهلة المسح، وجيبين معزولين للرضّاعات، وحصيرة تغيير قابلة للطي في جيبها الخاص.",
    ],
    det: [
      ["Fold-out changing mat included", "حصيرة تغيير قابلة للطي مرفقة"],
      ["Two insulated bottle pockets", "جيبان معزولان للرضّاعات"],
      ["Pram clips included", "مشابك للعربة مرفقة"],
      ["Wipe-clean lining", "بطانة سهلة المسح"],
    ],
    care: CARE_WIPE,
    cat: "changing-bags",
    price: 24500,
    art: "bag",
    cols: ["plum", "grey", "sage"],
    sizes: ONE_SIZE,
    ages: ["newborn", "0-6m", "6-12m", "1-2y"],
    rating: 4.7,
    reviews: 156,
    daysOld: 52,
  },
  {
    h: "weekend-tote-changing-bag",
    n: ["Weekend Tote Changing Bag", "حقيبة ويكند للتغيير"],
    s: ["Doesn't look like a baby bag", "لا تبدو كحقيبة أطفال"],
    d: [
      "A structured tote that passes for a normal bag, with the changing kit hidden in a removable insert.",
      "حقيبة أنيقة تبدو كحقيبة عادية، مع مستلزمات التغيير في بطانة داخلية قابلة للإزالة.",
    ],
    det: [
      ["Removable organiser insert", "منظّم داخلي قابل للإزالة"],
      ["Changing mat included", "حصيرة تغيير مرفقة"],
      ["Vegan leather", "جلد نباتي"],
    ],
    care: CARE_WIPE,
    cat: "changing-bags",
    price: 19000,
    art: "bag",
    cols: ["clay", "cream"],
    sizes: ONE_SIZE,
    ages: ["newborn", "0-6m", "6-12m"],
    rating: 4.4,
    reviews: 61,
    daysOld: 110,
  },

  /* --- Cots ----------------------------------------------------------- */
  {
    h: "willow-cot-bed",
    n: ["Willow Cot Bed", "سرير ويلو القابل للتحويل"],
    s: ["Cot now, toddler bed later", "سرير طفل الآن وسرير صغير لاحقاً"],
    d: [
      "Solid beech with three mattress heights, converting to a toddler bed and then a small sofa. Ten years from one piece of furniture.",
      "خشب زان صلب بثلاثة ارتفاعات للمرتبة، يتحوّل إلى سرير للأطفال ثم إلى أريكة صغيرة. عشر سنوات من قطعة أثاث واحدة.",
    ],
    det: [
      ["Solid beech, water-based lacquer", "خشب زان صلب بطلاء مائي"],
      ["Three mattress heights", "ثلاثة ارتفاعات للمرتبة"],
      ["Converts to toddler bed and sofa", "يتحوّل إلى سرير صغير وأريكة"],
      ["Mattress sold separately", "المرتبة تُباع منفصلة"],
    ],
    care: CARE_WIPE,
    cat: "cots",
    price: 165000,
    art: "cot",
    cols: ["ivory", "grey", "cream"],
    sizes: ONE_SIZE,
    ages: ["newborn", "0-6m", "6-12m", "1-2y", "2-4y"],
    rating: 4.9,
    reviews: 88,
    daysOld: 33,
    featured: true,
  },
  {
    h: "glide-bedside-crib",
    n: ["Glide Bedside Crib", "سرير جلايد الملاصق"],
    s: ["Drops down beside your bed", "ينخفض جانب سريرك"],
    d: [
      "A bedside crib with a drop-down side and six height settings, so night feeds don't mean getting up.",
      "سرير ملاصق بجانب قابل للإنزال وستة إعدادات ارتفاع، لتكون الرضعات الليلية دون النهوض.",
    ],
    det: [
      ["Six height positions", "ستة أوضاع للارتفاع"],
      ["Drop-down mesh side", "جانب شبكي قابل للإنزال"],
      ["Tilt function for reflux", "إمكانية الإمالة لحالات الارتجاع"],
      ["Mattress included", "المرتبة مرفقة"],
    ],
    care: CARE_WIPE,
    cat: "cots",
    price: 89000,
    art: "cot",
    cols: ["grey", "ivory"],
    sizes: ONE_SIZE,
    ages: ["newborn", "0-6m"],
    rating: 4.8,
    reviews: 204,
    daysOld: 80,
    best: true,
  },
  {
    h: "moses-basket-and-stand",
    n: ["Moses Basket & Stand", "سلة موسى مع الحامل"],
    s: ["Moves room to room", "تتنقّل من غرفة إلى غرفة"],
    d: [
      "Handwoven palm-leaf basket with a cotton liner and a rocking beech stand, for the first four months downstairs.",
      "سلة منسوجة يدوياً من سعف النخيل ببطانة قطنية وحامل هزّاز من خشب الزان، للأشهر الأربعة الأولى.",
    ],
    det: [
      ["Handwoven palm leaf", "منسوجة يدوياً من سعف النخيل"],
      ["Washable cotton liner", "بطانة قطنية قابلة للغسل"],
      ["Rocking beech stand included", "حامل هزّاز من الزان مرفق"],
    ],
    care: CARE_COTTON,
    cat: "cots",
    price: 52000,
    was: 64000,
    art: "cot",
    cols: ["cream", "ivory"],
    sizes: ONE_SIZE,
    ages: ["newborn", "0-6m"],
    rating: 4.6,
    reviews: 71,
    daysOld: 165,
  },

  /* --- Bedding -------------------------------------------------------- */
  {
    h: "muslin-swaddle-3-pack",
    n: ["Muslin Swaddle, 3-Pack", "أقمطة موسلين، 3 قطع"],
    s: ["120 × 120cm, gets softer", "120 × 120 سم وتزداد نعومة"],
    d: [
      "Three generous 120cm squares of double-gauze muslin — swaddle, sunshade, burp cloth, floor mat, all of it.",
      "ثلاث قطع كبيرة 120 سم من الموسلين المزدوج — قماط، وواقٍ من الشمس، ومنشفة، وفرشة أرضية.",
    ],
    det: [
      ["120 × 120cm each", "120 × 120 سم للقطعة"],
      ["Double-gauze cotton", "قطن بطبقتين"],
      ["Three per pack", "ثلاث قطع في العبوة"],
    ],
    care: CARE_COTTON,
    cat: "bedding",
    price: 9000,
    art: "bedding",
    cols: ["cloud", "blush", "sage"],
    sizes: ONE_SIZE,
    ages: ["newborn", "0-6m", "6-12m"],
    rating: 4.9,
    reviews: 341,
    daysOld: 90,
    best: true,
  },
  {
    h: "cloud-quilt-and-bumper-set",
    n: ["Cloud Quilt & Bumper Set", "طقم لحاف وحماية سرير سحابي"],
    s: ["Printed with the doodle clouds", "بطبعة الغيوم المرسومة"],
    d: [
      "A cotton quilt and breathable mesh bumper printed with the Bambino cloud doodles, sized for the Willow cot bed.",
      "لحاف قطني وحماية شبكية تسمح بمرور الهواء بطبعة غيوم بامبينو، بمقاس سرير ويلو.",
    ],
    det: [
      ["Breathable mesh bumper", "حماية شبكية تسمح بمرور الهواء"],
      ["Fits 120 × 60cm cots", "تناسب الأسرّة 120 × 60 سم"],
      ["Cotton cover, hollowfibre fill", "غطاء قطني بحشوة ألياف مجوّفة"],
    ],
    care: CARE_COTTON,
    cat: "bedding",
    price: 26500,
    art: "bedding",
    cols: ["cloud", "mint"],
    sizes: ONE_SIZE,
    ages: ["newborn", "0-6m", "6-12m", "1-2y"],
    rating: 4.6,
    reviews: 49,
    daysOld: 58,
  },
  {
    h: "cotton-sleeping-bag-1-tog",
    n: ["Cotton Sleeping Bag 1.0 Tog", "كيس نوم قطني 1.0 توج"],
    s: ["For an air-conditioned room", "لغرفة مكيّفة"],
    d: [
      "A 1.0 tog bag — the right weight for a room held at 24°C, which is most Kuwaiti bedrooms most of the year.",
      "كيس بوزن 1.0 توج — الوزن المناسب لغرفة على 24 درجة، وهو حال معظم غرف النوم في الكويت أغلب السنة.",
    ],
    det: [
      ["1.0 tog, for 20–24°C rooms", "1.0 توج لغرف 20–24 درجة"],
      ["Two-way zip from the bottom", "سحّاب باتجاهين من الأسفل"],
      ["Fitted neck, no hood", "رقبة مضبوطة بدون غطاء رأس"],
    ],
    care: CARE_COTTON,
    cat: "bedding",
    price: 13500,
    was: 16000,
    art: "bedding",
    cols: ["mint", "blush", "ivory"],
    sizes: ["0-3m", "6-9m", "12-18m", "18-24m"],
    rating: 4.7,
    reviews: 127,
    daysOld: 145,
  },

  /* --- Highchairs ----------------------------------------------------- */
  {
    h: "grow-with-me-highchair",
    n: ["Grow-With-Me Highchair", "كرسي طعام ينمو معهم"],
    s: ["Highchair to desk chair", "من كرسي طعام إلى كرسي مكتب"],
    d: [
      "Beech frame with an adjustable seat and footplate that keeps working from six months until they're doing homework at it.",
      "هيكل من الزان بمقعد ومسند قدمين قابلين للتعديل، يستمر من ستة أشهر حتى سنّ الواجبات المدرسية.",
    ],
    det: [
      ["Adjustable seat and footplate", "مقعد ومسند قدمين قابلان للتعديل"],
      ["Removable dishwasher-safe tray", "صينية قابلة للفك وآمنة في غسالة الصحون"],
      ["Five-point harness", "حزام أمان بخمس نقاط"],
      ["Tested to 90kg", "مختبر حتى 90 كغم"],
    ],
    care: CARE_WIPE,
    cat: "highchairs",
    price: 68000,
    art: "highchair",
    cols: ["ivory", "grey", "sage"],
    sizes: ONE_SIZE,
    ages: ["6-12m", "1-2y", "2-4y", "4-6y"],
    rating: 4.8,
    reviews: 193,
    daysOld: 42,
    featured: true,
  },
  {
    h: "clip-on-travel-highchair",
    n: ["Clip-On Travel Highchair", "كرسي طعام محمول بمشبك"],
    s: ["Clamps onto a restaurant table", "يُثبَّت على طاولة المطعم"],
    d: [
      "Clamps to any table up to 8cm thick and folds into the changing bag. The answer to restaurants with no highchairs.",
      "يُثبَّت على أي طاولة بسماكة تصل إلى 8 سم ويُطوى داخل حقيبة التغيير. الحل للمطاعم بلا كراسي أطفال.",
    ],
    det: [
      ["Fits tables up to 8cm thick", "يناسب الطاولات حتى سماكة 8 سم"],
      ["Folds flat, carry bag included", "يُطوى مسطّحاً مع حقيبة حمل"],
      ["Machine washable seat", "مقعد قابل للغسل الآلي"],
    ],
    care: CARE_WIPE,
    cat: "highchairs",
    price: 28000,
    art: "highchair",
    cols: ["navy", "orchid"],
    sizes: ONE_SIZE,
    ages: ["6-12m", "1-2y", "2-4y"],
    rating: 4.5,
    reviews: 84,
    daysOld: 105,
  },

  /* --- Bottles -------------------------------------------------------- */
  {
    h: "anti-colic-bottle-3-pack",
    n: ["Anti-Colic Bottle, 3-Pack", "رضّاعة مضادة للمغص، 3 قطع"],
    s: ["Vented base, slow-flow teat", "قاعدة بفتحات تهوية وحلمة بطيئة"],
    d: [
      "A vented base that keeps air out of the milk, with a wide slow-flow teat shaped for babies who move between breast and bottle.",
      "قاعدة مهوّاة تمنع دخول الهواء إلى الحليب، مع حلمة عريضة بطيئة التدفّق مصمّمة للرضّع الذين ينتقلون بين الثدي والرضّاعة.",
    ],
    det: [
      ["260ml, three per pack", "260 مل، ثلاث قطع في العبوة"],
      ["BPA-free polypropylene", "بولي بروبيلين خالٍ من BPA"],
      ["Slow-flow teat, 0m+", "حلمة بطيئة التدفّق من الولادة"],
      ["Dishwasher and steriliser safe", "آمنة في غسالة الصحون والمعقّم"],
    ],
    cat: "bottles",
    price: 11500,
    art: "bottle",
    cols: ["cloud", "mint"],
    sizes: ONE_SIZE,
    ages: ["newborn", "0-6m", "6-12m"],
    rating: 4.7,
    reviews: 268,
    daysOld: 85,
    best: true,
  },
  {
    h: "first-weaning-set",
    n: ["First Weaning Set", "طقم بداية الطعام"],
    s: ["Bowl, spoons, suction base", "صحن وملاعق وقاعدة شفط"],
    d: [
      "A silicone bowl that suctions to the tray, two soft-tipped spoons and a lid — everything for the first month of solids.",
      "صحن سيليكون يلتصق بالصينية، وملعقتان بأطراف ناعمة، وغطاء — كل ما يلزم لشهر الطعام الأول.",
    ],
    det: [
      ["Food-grade silicone", "سيليكون غذائي"],
      ["Suction base", "قاعدة شفط"],
      ["Two soft-tipped spoons", "ملعقتان بأطراف ناعمة"],
    ],
    cat: "bottles",
    price: 8500,
    art: "bottle",
    cols: ["sage", "clay", "orchid"],
    sizes: ONE_SIZE,
    ages: ["6-12m", "1-2y"],
    rating: 4.6,
    reviews: 112,
    daysOld: 62,
  },
  {
    h: "insulated-toddler-cup",
    n: ["Insulated Toddler Cup", "كوب معزول للأطفال"],
    s: ["Stays cold for six hours", "يبقى بارداً ست ساعات"],
    d: [
      "Double-walled stainless steel with a weighted straw, so it works at any angle and stays cold from the car to the park.",
      "فولاذ مقاوم للصدأ بجدار مزدوج ومصّاصة موزونة، يعمل بأي زاوية ويبقى بارداً من السيارة إلى الحديقة.",
    ],
    det: [
      ["Double-walled stainless steel", "فولاذ مقاوم للصدأ بجدار مزدوج"],
      ["Weighted straw", "مصّاصة موزونة"],
      ["300ml", "300 مل"],
    ],
    cat: "bottles",
    price: 5500,
    was: 7000,
    art: "bottle",
    cols: ["orchid", "mint", "sun"],
    sizes: ONE_SIZE,
    ages: ["1-2y", "2-4y", "4-6y"],
    rating: 4.8,
    reviews: 197,
    daysOld: 118,
  },

  /* --- Soft toys ------------------------------------------------------ */
  {
    h: "bambino-the-elephant-plush",
    n: ["Bambino the Elephant Plush", "دمية بامبينو الفيل"],
    s: ["The one from the logo", "الفيل الذي في الشعار"],
    d: [
      "Our elephant, off the label and into a 32cm plush with weighted feet so it sits up on its own. Fully machine washable.",
      "فيلنا يخرج من الشعار إلى دمية بطول 32 سم بأقدام موزونة تجعله يجلس بمفرده. قابل للغسل الآلي بالكامل.",
    ],
    det: [
      ["32cm tall, weighted feet", "بطول 32 سم بأقدام موزونة"],
      ["Machine washable at 30°C", "قابل للغسل الآلي على 30 درجة"],
      ["Embroidered features, no small parts", "ملامح مطرّزة بدون قطع صغيرة"],
      ["Suitable from birth", "مناسب من الولادة"],
    ],
    care: CARE_COTTON,
    cat: "soft-toys",
    price: 12000,
    art: "teddy",
    cols: ["orchid", "mint", "cream"],
    sizes: ONE_SIZE,
    ages: ["newborn", "0-6m", "6-12m", "1-2y", "2-4y"],
    rating: 5,
    reviews: 156,
    daysOld: 5,
    featured: true,
    best: true,
  },
  {
    h: "crinkle-cloud-comforter",
    n: ["Crinkle Cloud Comforter", "دمية سحابة بصوت حفيف"],
    s: ["Crinkle ears, knotted corners", "أذنان بصوت حفيف وأطراف معقودة"],
    d: [
      "A flat cloud comforter with crinkle ears and knotted corners sized for a small fist. Buy two — one is always missing.",
      "سحابة مسطّحة بأذنين تصدران صوت حفيف وأطراف معقودة بحجم قبضة صغيرة. اشترِ اثنتين — واحدة دائماً مفقودة.",
    ],
    det: [
      ["Crinkle ears", "أذنان بصوت حفيف"],
      ["Knotted corners", "أطراف معقودة"],
      ["Suitable from birth", "مناسبة من الولادة"],
    ],
    care: CARE_COTTON,
    cat: "soft-toys",
    price: 6500,
    art: "teddy",
    cols: ["cloud", "blush"],
    sizes: ONE_SIZE,
    ages: ["newborn", "0-6m", "6-12m"],
    rating: 4.7,
    reviews: 93,
    daysOld: 72,
  },
  {
    h: "sensory-activity-arch",
    n: ["Sensory Activity Arch", "قوس الأنشطة الحسّية"],
    s: ["Fits pram, cot and play mat", "يناسب العربة والسرير وفرشة اللعب"],
    d: [
      "A wooden arch with five detachable hanging toys — mirror, rattle, crinkle leaf, teether and a small elephant.",
      "قوس خشبي بخمس ألعاب معلّقة قابلة للفك — مرآة وخشخيشة وورقة حفيف وعضّاضة وفيل صغير.",
    ],
    det: [
      ["Five detachable toys", "خمس ألعاب قابلة للفك"],
      ["FSC beech frame", "هيكل زان معتمد FSC"],
      ["Fits prams and cots", "يناسب العربات والأسرّة"],
    ],
    cat: "soft-toys",
    price: 18500,
    art: "teddy",
    cols: ["cream", "sage"],
    sizes: ONE_SIZE,
    ages: ["newborn", "0-6m", "6-12m"],
    rating: 4.6,
    reviews: 64,
    daysOld: 96,
  },

  /* --- Bath ----------------------------------------------------------- */
  {
    h: "fold-flat-baby-bath",
    n: ["Fold-Flat Baby Bath", "بانيو أطفال قابل للطي"],
    s: ["Hangs on the back of a door", "يُعلَّق خلف الباب"],
    d: [
      "Folds to 8cm and hangs flat, with a newborn support that lifts out once they can sit.",
      "يُطوى إلى 8 سم ويُعلَّق مسطّحاً، مع دعامة لحديثي الولادة تُزال عندما يستطيعون الجلوس.",
    ],
    det: [
      ["Folds to 8cm deep", "يُطوى بعمق 8 سم"],
      ["Removable newborn support", "دعامة قابلة للإزالة لحديثي الولادة"],
      ["Drain plug", "سدادة تصريف"],
      ["Temperature-sensitive base", "قاعدة حسّاسة لدرجة الحرارة"],
    ],
    care: CARE_WIPE,
    cat: "bath-time",
    price: 22000,
    art: "bath",
    cols: ["mint", "cloud", "grey"],
    sizes: ONE_SIZE,
    ages: ["newborn", "0-6m", "6-12m"],
    rating: 4.7,
    reviews: 138,
    daysOld: 68,
  },
  {
    h: "hooded-towel-2-pack",
    n: ["Hooded Towel, 2-Pack", "منشفة بغطاء رأس، قطعتان"],
    s: ["With ears, obviously", "بأذنين، بالطبع"],
    d: [
      "Two hooded towels in cotton terry with an elephant-ear hood, big enough to still work at two years old.",
      "منشفتان من القطن التيري بغطاء رأس على شكل أذني فيل، كبيرتان بما يكفي لتظلا مفيدتين حتى عمر السنتين.",
    ],
    det: [
      ["100 × 100cm each", "100 × 100 سم للقطعة"],
      ["500gsm cotton terry", "قطن تيري بوزن 500 غم/م²"],
      ["Two per pack", "قطعتان في العبوة"],
    ],
    care: CARE_COTTON,
    cat: "bath-time",
    price: 11000,
    was: 14000,
    art: "bath",
    cols: ["ivory", "mint", "blush"],
    sizes: ONE_SIZE,
    ages: ["newborn", "0-6m", "6-12m", "1-2y"],
    rating: 4.8,
    reviews: 172,
    daysOld: 128,
  },
];

/* --------------------------------------------------------------------------
 * Builders
 * ----------------------------------------------------------------------- */

const SIZE_TO_AGE: Record<string, AgeGroup> = {
  newborn: "newborn",
  "0-3m": "0-6m",
  "3-6m": "0-6m",
  "6-9m": "6-12m",
  "9-12m": "6-12m",
  "12-18m": "1-2y",
  "18-24m": "1-2y",
  "2-3y": "2-4y",
  "3-4y": "2-4y",
  "4-5y": "4-6y",
  "5-6y": "4-6y",
};

/** Stable pseudo-random so stock levels don't change between renders. */
function seededInt(key: string, max: number) {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % max;
}

function pair([en, ar]: Pair) {
  return { en, ar };
}

function build(seed: Seed): Product {
  const category = categoryBySlug(seed.cat);
  if (!category) throw new Error(`Unknown category "${seed.cat}"`);

  const variants: Variant[] = [];
  for (const colour of seed.cols) {
    for (const size of seed.sizes) {
      const id = `${seed.h}--${colour}--${size}`;
      // Roughly one variant in nine is out of stock, deterministically.
      const roll = seededInt(id, 9);
      variants.push({ id, size, colour, stock: roll === 0 ? 0 : roll + 1 });
    }
  }

  const ages =
    seed.ages ??
    [...new Set(seed.sizes.map((s) => SIZE_TO_AGE[s]).filter(Boolean))];

  return {
    id: seed.h,
    handle: seed.h,
    name: pair(seed.n),
    summary: pair(seed.s),
    description: pair(seed.d),
    details: seed.det.map(pair),
    care: seed.care ? pair(seed.care) : undefined,
    category: seed.cat,
    department: category.department,
    price: seed.price,
    compareAtPrice: seed.was,
    art: seed.art,
    colours: seed.cols.map((key) => COLOURS[key]),
    variants,
    ageGroups: ages,
    rating: seed.rating,
    reviewCount: seed.reviews,
    daysOld: seed.daysOld,
    featured: seed.featured,
    bestseller: seed.best,
  };
}

export const PRODUCTS: Product[] = SEEDS.map(build);
