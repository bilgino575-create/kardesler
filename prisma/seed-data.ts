// Kardeşler Tobacco ERP - initial product catalog seed data.
// Prices and stock are intentionally left at 0 — no real business figures were
// supplied for these products. Fill them in from the admin panel after seeding.

export type SeedProduct = {
  name: string;
  brand?: string;
  unit?: "PIECE" | "BOX" | "PACK" | "KG" | "GRAM" | "LITER" | "METER";
};

export type SeedSubcategory = {
  name: string;
  products: SeedProduct[];
};

export type SeedCategory = {
  name: string;
  slug: string;
  subcategories: SeedSubcategory[];
};

export const catalog: SeedCategory[] = [
  {
    name: "Sigara ve Tütün Mamülleri",
    slug: "sigara-ve-tutun-mamulleri",
    subcategories: [
      {
        name: "Winston Grubu",
        products: [
          { name: "Winston Slender Q Line", brand: "Winston" },
          { name: "Winston Slender Blue", brand: "Winston" },
          { name: "Winston Slender Blue Long", brand: "Winston" },
          { name: "Winston Slim Blue", brand: "Winston" },
          { name: "Winston Dark Blue", brand: "Winston" },
          { name: "Winston Red", brand: "Winston" },
          { name: "Winston Gray", brand: "Winston" },
          { name: "Winston Xsence", brand: "Winston" },
        ],
      },
      {
        name: "Camel Grubu",
        products: [
          { name: "Camel Slender Blue", brand: "Camel" },
          { name: "Camel Slender Yellow", brand: "Camel" },
          { name: "Camel Deep Blue", brand: "Camel" },
          { name: "Camel White", brand: "Camel" },
          { name: "Camel Yellow (Box)", brand: "Camel" },
          { name: "Camel Yellow (Soft)", brand: "Camel" },
          { name: "Camel Slender Gray", brand: "Camel" },
          { name: "Camel Black & White", brand: "Camel" },
          { name: "Camel Slim Q Line", brand: "Camel" },
        ],
      },
      {
        name: "LD & Monte Carlo Grubu",
        products: [
          { name: "LD Blue", brand: "LD" },
          { name: "LD Blue Long", brand: "LD" },
          { name: "LD Slims", brand: "LD" },
          { name: "Monte Carlo Slender Blue", brand: "Monte Carlo" },
          { name: "Monte Carlo Dark Blue", brand: "Monte Carlo" },
        ],
      },
      {
        name: "Borton, Wentor & Diğer Stant Grupları",
        products: [
          { name: "Borton Red", brand: "Borton" },
          { name: "Borton White", brand: "Borton" },
          { name: "Borton Edge", brand: "Borton" },
          { name: "Wentor Midnight", brand: "Wentor" },
          { name: "Wentor Touch Blue", brand: "Wentor" },
          { name: "Wentor Touch Purple", brand: "Wentor" },
          { name: "Wentor Touch Blue Long", brand: "Wentor" },
          { name: "Wentor Slims", brand: "Wentor" },
          { name: "Sitey Blue", brand: "Sitey" },
          { name: "Sitey Slims", brand: "Sitey" },
          { name: "Calbor Night Blue", brand: "Calbor" },
        ],
      },
      {
        name: "Sarmalık Tütünler & Paketler",
        products: [
          { name: "Camel Yellow 100 Gram (Sarmalık Kıyılmış Tütün)", brand: "Camel", unit: "GRAM" },
          { name: "Hazır Sarılmış Paket Tütünler", unit: "PACK" },
        ],
      },
      {
        name: "Nargile Tütünleri & Aromaları",
        products: [
          { name: "Yahya Elegance Kutulu Nargile Tütünü (Karışık Aroma)", brand: "Yahya Elegance", unit: "BOX" },
        ],
      },
      {
        name: "Tütün Yan Ürünleri",
        products: [
          { name: "Machine Marka Kollu/Mekanik Sigara Sarma Makinesi", brand: "Machine" },
          { name: "Cemo Slim Sigara Tabakaları", brand: "Cemo" },
        ],
      },
    ],
  },
  {
    name: "Telefon Aksesuarları ve Elektronik",
    slug: "telefon-aksesuarlari-ve-elektronik",
    subcategories: [
      {
        name: "Şarj Cihazları ve Adaptörler",
        products: [
          { name: "YK Design Fast Charger 67W (USB to Type-C - TK-SR07)", brand: "YK Design" },
          { name: "Sub Zero CA50 Lightning Dual Adaptor (iPhone XR/XS/Pro Max)", brand: "Sub Zero" },
          { name: "Auris Hızlı Şarj Adaptörü", brand: "Auris" },
        ],
      },
      {
        name: "Kablolar",
        products: [
          { name: "Syrox 60W PD Type-C to Type-C Data ve Şarj Kablosu", brand: "Syrox" },
          { name: "Syrox 3.0A Micro Şarj Kablosu", brand: "Syrox" },
          { name: "Syrox 3.0A Type-C Şarj Kablosu", brand: "Syrox" },
          { name: "DMAX Professional Gold Uçlu HDMI Kablosu", brand: "DMAX" },
        ],
      },
      {
        name: "Ses Sistemleri & Kulaklıklar",
        products: [
          { name: "Torima Wireless Speaker D10 Bluetooth Hoparlör", brand: "Torima" },
          { name: "Torima Mini Portable Speaker", brand: "Torima" },
          { name: "Torima True Wireless Earpods Kulaklık", brand: "Torima" },
          { name: "Syrox Stereo Sound Handsfree Kulakiçi Kulaklık", brand: "Syrox" },
          { name: "Hava Wireless Speaker", brand: "Hava" },
          { name: "Hava Bluetooth Kulaklık", brand: "Hava" },
          { name: "TWS Kablosuz Bluetooth Kulaklık" },
        ],
      },
      {
        name: "Görüntü & Akıllı Cihazlar",
        products: [
          { name: "Android TV Stick Medya Oynatıcı" },
          { name: "Vega VNS Pro Akıllı Saat", brand: "Vega" },
          { name: "Yolemi Mini Massage Gun (Masaj Tabancası)", brand: "Yolemi" },
          { name: "Rico Promax+ Akıllı Aksesuar", brand: "Rico" },
        ],
      },
      {
        name: "Mağaza Demirbaş & Çalışma Aletleri",
        products: [
          { name: "Kablosuz El Tipi Barkod Okuyucu / Tarayıcı" },
          { name: "Bozyel Elektronik Hassas Tezgah Üstü Terazi", brand: "Bozyel" },
        ],
      },
    ],
  },
  {
    name: "Av, Kamp ve Kişisel Aksesuarlar",
    slug: "av-kamp-ve-kisisel-aksesuarlar",
    subcategories: [
      {
        name: "Columbia Av Bıçakları Serisi",
        products: [
          { name: "Columbia Ahşap Saplı Klasik Av Bıçağı", brand: "Columbia" },
          { name: "Columbia Kompozit Geyik/Kurt Desenli Av Bıçağı", brand: "Columbia" },
          { name: "Kılıflı Büyük Boy Kamp Bıçağı (Deri/Kumaş Kılıflı)" },
        ],
      },
      {
        name: "Çakılar ve Çakmaklar",
        products: [
          { name: "Ay-Yıldız / Türk Bayraklı Katlanabilir Çakı" },
          { name: "Sürmene İşlemeli Ahşap Çakı" },
          { name: "Klasik Muhtarlı Metal Çakı" },
          { name: "Rezistanslı/Elektronik Çakmak" },
        ],
      },
      {
        name: "Cüzdan Grubu",
        products: [
          { name: "Erkek Hakiki Deri Dikey Cüzdan" },
          { name: "Erkek Hakiki Deri Yatay Cüzdan (Siyah/Kahverengi)" },
          { name: "Kadın Çok Bölmeli Fermuarlı Portföy Cüzdan (Gold/Krem/Siyah)" },
        ],
      },
      {
        name: "Kişisel Bakım El Aletleri",
        products: [
          { name: "Paslanmaz Çelik Tırnak Makası (Stantlı Dökme Paket)" },
          { name: "Metal Cımbız" },
          { name: "Tırnak Törpüsü" },
        ],
      },
    ],
  },
  {
    name: "Çakmak Gazlı, Pürmüz ve Nargile Takımları",
    slug: "cakmak-gazli-purmuz-ve-nargile-takimlari",
    subcategories: [
      {
        name: "Çakmak Serileri",
        products: [
          { name: "Stantlı Clipper Desenli Gazlı Çakmak", brand: "Clipper" },
          { name: "Bic Tarzı Klasik Taşlı Çakmak", brand: "Bic" },
        ],
      },
      {
        name: "Pürmüzler",
        products: [
          { name: "Doldurulabilir Büyük Boy Mutfak/Masa Pürmüz Çakmağı" },
          { name: "Tabanca Tipi Uzun Pürmüzlü Çakmak" },
          { name: "Ocak Tipi Ayarlanabilir Pürmüz (Mavi/Yeşil/Sarı/Turuncu/Pembe)" },
        ],
      },
      {
        name: "Nargile Takımları",
        products: [
          { name: "Büyük Boy Mavi Cam Nargile Takımı" },
          { name: "Kamuflaj Desenli Nargile Takımı" },
          { name: "Siyah-Gold Tasarım Nargile Takımı" },
          { name: "Ahşap Gövdeli Nargile Takımı" },
          { name: "Şeffaf Cam Klasik Nargile Takımı" },
        ],
      },
      {
        name: "Nargile Parçaları & Aksesuarları",
        products: [
          { name: "Toprak Nargile Lülesi" },
          { name: "Sırlı Seramik Nargile Lülesi" },
          { name: "Elektrikli Nargile Ocağı (Zemu Isi / Zemu Isi 2'li Stant)", brand: "Zemu Isi" },
        ],
      },
    ],
  },
  {
    name: "Kişisel Bakım, Kozmetik ve Kimya",
    slug: "kisisel-bakim-kozmetik-ve-kimya",
    subcategories: [
      {
        name: "Parfüm & Ortam Kokuları",
        products: [
          { name: "Sarp Bamboo Çubuklu Oda Kokusu (Kavun, İğde vb.)", brand: "Sarp" },
          { name: "Sarp Çok Amaçlı Sıvı Oda ve Ortam Kokusu (Sprey Şişe)", brand: "Sarp" },
        ],
      },
      {
        name: "Hijyen & Kolonya",
        products: [
          { name: "Hayat Sprey Şişeli Limon Kolonyası", brand: "Hayat" },
          { name: "Muhtelif Saç ve Vücut Spreyi" },
          { name: "El Dezenfektanı" },
          { name: "Cep Mendili" },
          { name: "Islak Mendil Paketi" },
        ],
      },
      {
        name: "Ağız Bakım",
        products: [
          { name: "Colgate Diş Macunu", brand: "Colgate" },
          { name: "Koruyucu Kapaklı Yetişkin Diş Fırçası" },
        ],
      },
      {
        name: "Haşere İlaçları",
        products: [
          { name: "Insectum Avcısı Bit-Pire-Kene-Akrep Haşere Spreyi", brand: "Insectum" },
        ],
      },
    ],
  },
  {
    name: "Oyuncak, Hobi ve Kırtasiye",
    slug: "oyuncak-hobi-ve-kirtasiye",
    subcategories: [
      {
        name: "Kız Çocuk & Peluş Grubu",
        products: [
          { name: "Askılı Pembe Pusetli Plastik Oyuncak Bebek" },
          { name: "\"Tea Set\" Blister Ambalajlı Plastik Oyuncak Çay Seti" },
          { name: "Labubu Kutulu Peluş/Plastik Figür Oyuncak", brand: "Labubu" },
          { name: "\"Seni Seviyorum\" Kalpli Pembe Peluş Ayıcık" },
          { name: "Sürpriz Kutulu Küçük Kız Oyuncağı" },
        ],
      },
      {
        name: "Erkek Çocuk & Eğlence",
        products: [
          { name: "\"Mars\" Serisi Uzaktan Kumandalı Yarış Arabası" },
          { name: "\"Polis\" Serisi Uzaktan Kumandalı Polis Arabası" },
          { name: "Sürtmeli Plastik Oyuncak İtfaiye Kamyonu" },
          { name: "Sürtmeli Oyuncak İş Makinası" },
          { name: "\"Police Force\" Blister Ambalajlı Oyuncak Tabanca ve Kelepçe Seti", brand: "Police Force" },
        ],
      },
      {
        name: "Dış Mekan & Aktivite",
        products: [
          { name: "Coolwheels \"Twist with Light\" Işıklı Çocuk Scooter (Mavi/Pembe/Sarı)", brand: "Coolwheels" },
          { name: "Fileli Dikişli Voleybol Topu" },
          { name: "Fileli Futbol Topu" },
          { name: "Dökme Sepet İçi Renkli Çocuk Topu" },
          { name: "Rengarenk Atlama İpi" },
        ],
      },
      {
        name: "Kutu Oyunları & Kırtasiye",
        products: [
          { name: "Uno Kart Oyunu (Kutulu)", brand: "Uno" },
          { name: "Pompalı Plastik Su Tabancası" },
          { name: "Köpük Balon Çıkartan Tüp" },
          { name: "Su Balonu Seti" },
          { name: "\"Eraser\" Figürlü Ambalajlı Silgi Seti" },
          { name: "Renkli Oyun Hamuru" },
        ],
      },
    ],
  },
  {
    name: "Gıda, Hızlı Tüketim ve Mağaza Sarf Malzemeleri",
    slug: "gida-hizli-tuketim-ve-magaza-sarf-malzemeleri",
    subcategories: [
      {
        name: "Litre Grubu Gazlı İçecekler",
        products: [
          { name: "Coca-Cola 1.5L Pet", brand: "Coca-Cola", unit: "LITER" },
          { name: "Coca-Cola 2L Pet", brand: "Coca-Cola", unit: "LITER" },
          { name: "Fanta 1.5L Pet", brand: "Fanta", unit: "LITER" },
          { name: "Fanta 2L Pet", brand: "Fanta", unit: "LITER" },
          { name: "Pepsi 1.5L Pet", brand: "Pepsi", unit: "LITER" },
          { name: "Pepsi 2L Pet", brand: "Pepsi", unit: "LITER" },
          { name: "Yedigün 1.5L Pet", brand: "Yedigün", unit: "LITER" },
          { name: "Yedigün 2L Pet", brand: "Yedigün", unit: "LITER" },
          { name: "Fruko Gazoz Pet", brand: "Fruko", unit: "LITER" },
        ],
      },
      {
        name: "Kutu ve Küçük İçecekler",
        products: [
          { name: "Teneke Kutu Pepsi", brand: "Pepsi" },
          { name: "Teneke Kutu Coca-Cola", brand: "Coca-Cola" },
          { name: "Cappy Meyve Suyu (Küçük/Orta Boy Kutu)", brand: "Cappy" },
          { name: "Cam Şişe Doğal Maden Suyu (Soda)" },
          { name: "Teneke Kutu Enerji İçeceği (Muhtelif Marka)" },
          { name: "Özkaynak/Koroplast Büyük Boy Aromalı Meyve İçeceği", brand: "Özkaynak/Koroplast" },
        ],
      },
      {
        name: "Gıda Dışı Sarf Malzemeleri",
        products: [
          { name: "Duracell Kalem Pil (AA)", brand: "Duracell" },
          { name: "Duracell İnce Pil (AAA)", brand: "Duracell" },
          { name: "Panasonic/Toshiba Kumanda Pili (Kartlı Paket)", brand: "Panasonic/Toshiba" },
          { name: "POS Cihazı ve Yazıcılar İçin Termal Rulo Kağıt (Stok Kolisi)", unit: "BOX" },
          { name: "Şeffaf Kilitli Poşet", unit: "PACK" },
          { name: "Çöp Poşeti", unit: "PACK" },
          { name: "Sadaka Kutusu" },
          { name: "Şeffaf Tekerlekli Büyük Plastik Saklama/Stok Kutusu" },
        ],
      },
      {
        name: "Çaylar",
        products: [
          { name: "El Seyf Black Tea (Kutulu Siyah Çay)", brand: "El Seyf", unit: "BOX" },
          { name: "Camelon Classic Taste Tütün/Bitki Çayı", brand: "Camelon" },
          { name: "Layalina Bitkisel Ürünler", brand: "Layalina" },
        ],
      },
    ],
  },
];
