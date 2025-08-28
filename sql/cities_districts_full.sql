-- FULL SEED: Cities (81) and Districts (extendable)
-- Prereq: Run main database.sql first to create tables and RLS

-- 1) Insert 81 Cities (upsert by name)
INSERT INTO cities(name, plate)
VALUES
('Adana', 1),('Adıyaman', 2),('Afyonkarahisar', 3),('Ağrı', 4),('Amasya', 5),('Ankara', 6),('Antalya', 7),('Artvin', 8),('Aydın', 9),('Balıkesir', 10),
('Bilecik', 11),('Bingöl', 12),('Bitlis', 13),('Bolu', 14),('Burdur', 15),('Bursa', 16),('Çanakkale', 17),('Çankırı', 18),('Çorum', 19),('Denizli', 20),
('Diyarbakır', 21),('Edirne', 22),('Elazığ', 23),('Erzincan', 24),('Erzurum', 25),('Eskişehir', 26),('Gaziantep', 27),('Giresun', 28),('Gümüşhane', 29),('Hakkari', 30),
('Hatay', 31),('Isparta', 32),('Mersin', 33),('İstanbul', 34),('İzmir', 35),('Kars', 36),('Kastamonu', 37),('Kayseri', 38),('Kırklareli', 39),('Kırşehir', 40),
('Kocaeli', 41),('Konya', 42),('Kütahya', 43),('Malatya', 44),('Manisa', 45),('Kahramanmaraş', 46),('Mardin', 47),('Muğla', 48),('Muş', 49),('Nevşehir', 50),
('Niğde', 51),('Ordu', 52),('Rize', 53),('Sakarya', 54),('Samsun', 55),('Siirt', 56),('Sinop', 57),('Sivas', 58),('Tekirdağ', 59),('Tokat', 60),
('Trabzon', 61),('Tunceli', 62),('Şanlıurfa', 63),('Uşak', 64),('Van', 65),('Yozgat', 66),('Zonguldak', 67),('Aksaray', 68),('Bayburt', 69),('Karaman', 70),
('Kırıkkale', 71),('Batman', 72),('Şırnak', 73),('Bartın', 74),('Ardahan', 75),('Iğdır', 76),('Yalova', 77),('Karabük', 78),('Kilis', 79),('Osmaniye', 80),('Düzce', 81)
ON CONFLICT (name) DO NOTHING;

-- 2) Insert Districts (partial examples). You can extend by adding more rows following the same pattern.
-- Important: Use city name join to resolve city_id
INSERT INTO districts(city_id, name)
SELECT c.id, d.name
FROM (
  VALUES
  -- İstanbul (sample)
  ('İstanbul','Adalar'),('İstanbul','Arnavutköy'),('İstanbul','Ataşehir'),('İstanbul','Avcılar'),('İstanbul','Bağcılar'),('İstanbul','Bahçelievler'),('İstanbul','Bakırköy'),('İstanbul','Başakşehir'),('İstanbul','Bayrampaşa'),('İstanbul','Beşiktaş'),('İstanbul','Beykoz'),('İstanbul','Beylikdüzü'),('İstanbul','Beyoğlu'),('İstanbul','Büyükçekmece'),('İstanbul','Çatalca'),('İstanbul','Çekmeköy'),('İstanbul','Esenler'),('İstanbul','Esenyurt'),('İstanbul','Eyüpsultan'),('İstanbul','Fatih'),('İstanbul','Gaziosmanpaşa'),('İstanbul','Güngören'),('İstanbul','Kadıköy'),('İstanbul','Kağıthane'),('İstanbul','Kartal'),('İstanbul','Küçükçekmece'),('İstanbul','Maltepe'),('İstanbul','Pendik'),('İstanbul','Sancaktepe'),('İstanbul','Sarıyer'),('İstanbul','Silivri'),('İstanbul','Sultanbeyli'),('İstanbul','Sultangazi'),('İstanbul','Şile'),('İstanbul','Şişli'),('İstanbul','Tuzla'),('İstanbul','Ümraniye'),('İstanbul','Üsküdar'),('İstanbul','Zeytinburnu'),
  -- Ankara (sample)
  ('Ankara','Altındağ'),('Ankara','Ayaş'),('Ankara','Bala'),('Ankara','Beypazarı'),('Ankara','Çankaya'),('Ankara','Çubuk'),('Ankara','Elmadağ'),('Ankara','Etimesgut'),('Ankara','Evren'),('Ankara','Gölbaşı'),('Ankara','Güdül'),('Ankara','Haymana'),('Ankara','Kalecik'),('Ankara','Kahramankazan'),('Ankara','Keçiören'),('Ankara','Kızılcahamam'),('Ankara','Mamak'),('Ankara','Nallıhan'),('Ankara','Polatlı'),('Ankara','Pursaklar'),('Ankara','Sincan'),('Ankara','Şereflikoçhisar'),('Ankara','Yenimahalle'),
  -- İzmir (sample)
  ('İzmir','Aliağa'),('İzmir','Balçova'),('İzmir','Bayındır'),('İzmir','Bayraklı'),('İzmir','Bergama'),('İzmir','Beydağ'),('İzmir','Bornova'),('İzmir','Buca'),('İzmir','Çeşme'),('İzmir','Çiğli'),('İzmir','Dikili'),('İzmir','Foça'),('İzmir','Gaziemir'),('İzmir','Güzelbahçe'),('İzmir','Karabağlar'),('İzmir','Karaburun'),('İzmir','Karşıyaka'),('İzmir','Kemalpaşa'),('İzmir','Kınık'),('İzmir','Kiraz'),('İzmir','Konak'),('İzmir','Menderes'),('İzmir','Menemen'),('İzmir','Narlıdere'),('İzmir','Ödemiş'),('İzmir','Seferihisar'),('İzmir','Selçuk'),('İzmir','Tire'),('İzmir','Torbalı'),('İzmir','Urla'),
  -- Balıkesir (full)
  ('Balıkesir','Altıeylül'),('Balıkesir','Karesi'),('Balıkesir','Ayvalık'),('Balıkesir','Bandırma'),('Balıkesir','Bigadiç'),('Balıkesir','Burhaniye'),('Balıkesir','Dursunbey'),('Balıkesir','Edremit'),('Balıkesir','Erdek'),('Balıkesir','Gönen'),('Balıkesir','Havran'),('Balıkesir','İvrindi'),('Balıkesir','Kepsut'),('Balıkesir','Manyas'),('Balıkesir','Marmara'),('Balıkesir','Savaştepe'),('Balıkesir','Sindırgı'),('Balıkesir','Susurluk'),('Balıkesir','Balya')
) AS d(city_name, name)
JOIN cities c ON c.name = d.city_name
ON CONFLICT (city_id, name) DO NOTHING;

-- To extend: append more ('City','District') pairs above and re-run.
