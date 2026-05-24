-- ============================================================
-- 005_seed_data.sql — Go Orient 初始数据
-- 包含：6 位导游 + 10 个旅游方案 + 10 篇内容帖子
-- 执行环境：Supabase SQL Editor（拥有 admin 权限）
-- ============================================================

-- 辅助：临时关闭 FK 检查（seed 专用）
SET session_replication_role = 'replica';

-- ============================================================
-- 1. 创建 auth.users（导游账号）
-- ============================================================
-- 密码统一为: GoOrient2026!

INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) VALUES
('00000000-0000-0000-0000-000000000000', 'a1b2c3d4-1111-4a11-b111-111111111101', 'authenticated', 'authenticated', 'liwei@go-orient.com', crypt('GoOrient2026!', gen_salt('bf')), NOW(), '{"display_name": "Li Wei", "role": "guide"}', NOW(), NOW(), '', '', '', ''),

('00000000-0000-0000-0000-000000000000', 'a1b2c3d4-2222-4a22-b222-222222222202', 'authenticated', 'authenticated', 'chenyu@go-orient.com', crypt('GoOrient2026!', gen_salt('bf')), NOW(), '{"display_name": "Chen Yu", "role": "guide"}', NOW(), NOW(), '', '', '', ''),

('00000000-0000-0000-0000-000000000000', 'a1b2c3d4-3333-4a33-b333-333333333303', 'authenticated', 'authenticated', 'wangfang@go-orient.com', crypt('GoOrient2026!', gen_salt('bf')), NOW(), '{"display_name": "Wang Fang", "role": "guide"}', NOW(), NOW(), '', '', '', ''),

('00000000-0000-0000-0000-000000000000', 'a1b2c3d4-4444-4a44-b444-444444444404', 'authenticated', 'authenticated', 'zhangmei@go-orient.com', crypt('GoOrient2026!', gen_salt('bf')), NOW(), '{"display_name": "Zhang Mei", "role": "guide"}', NOW(), NOW(), '', '', '', ''),

('00000000-0000-0000-0000-000000000000', 'a1b2c3d4-5555-4a55-b555-555555555505', 'authenticated', 'authenticated', 'liuyang@go-orient.com', crypt('GoOrient2026!', gen_salt('bf')), NOW(), '{"display_name": "Liu Yang", "role": "guide"}', NOW(), NOW(), '', '', '', ''),

('00000000-0000-0000-0000-000000000000', 'a1b2c3d4-6666-4a66-b666-666666666606', 'authenticated', 'authenticated', 'zhaoting@go-orient.com', crypt('GoOrient2026!', gen_salt('bf')), NOW(), '{"display_name": "Zhao Ting", "role": "guide"}', NOW(), NOW(), '', '', '', '');

-- ============================================================
-- 2. 创建 profiles（用户资料）
-- ============================================================
INSERT INTO public.profiles (id, email, display_name, avatar_url, role, bio, country, language) VALUES
('a1b2c3d4-1111-4a11-b111-111111111101', 'liwei@go-orient.com', 'Li Wei',
 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
 'guide',
 'Born and raised in Beijing''s historic hutongs, I''ve spent 8 years sharing the soul of China''s capital with travelers from around the world. My tours go beyond the Great Wall — I''ll take you to hidden courtyards, century-old noodle shops, and sunrise spots most tourists never find.',
 'China', '{"en","zh"}'),

('a1b2c3d4-2222-4a22-b222-222222222202', 'chenyu@go-orient.com', 'Chen Yu',
 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
 'guide',
 'A landscape photographer turned guide, I specialize in the breathtaking karst mountains of Guilin and Yangshuo. Whether it''s a sunrise hike above the Li River or cycling through rice terraces, I''ll help you capture China''s most iconic scenery.',
 'China', '{"en","zh"}'),

('a1b2c3d4-3333-4a33-b333-333333333303', 'wangfang@go-orient.com', 'Wang Fang',
 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
 'guide',
 'Xi''an is my home and my passion. With a degree in Chinese history and 6 years of guiding experience, I bring the Silk Road, the Terracotta Army, and the Tang Dynasty to life. I speak English, Chinese, and conversational Japanese.',
 'China', '{"en","zh","ja"}'),

('a1b2c3d4-4444-4a44-b444-444444444404', 'zhangmei@go-orient.com', 'Zhang Mei',
 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
 'guide',
 'Shanghai is where tradition meets tomorrow. I''m a foodie, a night owl, and your ultimate guide to this dazzling metropolis. From soup dumplings in hidden alleyways to rooftop bars overlooking the Bund, I know every corner of this city.',
 'China', '{"en","zh"}'),

('a1b2c3d4-5555-4a55-b555-555555555505', 'liuyang@go-orient.com', 'Liu Yang',
 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face',
 'guide',
 'Chengdu is not just pandas — it''s a lifestyle. I''ll take you to bamboo forests where giant pandas roam, tea houses where time stands still, and spicy hotpot joints that will change your life. Come hungry and curious.',
 'China', '{"en","zh"}'),

('a1b2c3d4-6666-4a66-b666-666666666606', 'zhaoting@go-orient.com', 'Zhao Ting',
 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face',
 'guide',
 'Hangzhou is poetry in motion. I guide travelers through misty West Lake mornings, ancient tea plantations, and poetic pagodas that inspired centuries of Chinese literature. I also speak French — bienvenue!',
 'China', '{"en","zh","fr"}');

-- ============================================================
-- 3. 创建 guide_profiles（导游资质）
-- ============================================================
INSERT INTO public.guide_profiles (id, certification_type, real_name, specialties, languages_spoken, service_cities, years_experience, verification_status, intro, gallery_urls) VALUES
('a1b2c3d4-1111-4a11-b111-111111111101', 'individual', '李伟',
 '{"Culture","History","Food"}',
 '{"English","Chinese"}',
 '{"Beijing","Tianjin"}',
 8, 'verified',
 'Beijing hutong explorer — showing you the soul of the capital beyond the tourist traps.',
 '{"https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=600","https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=600","https://images.unsplash.com/photo-1599707367812-042bfd7e5794?w=600"}'),

('a1b2c3d4-2222-4a22-b222-222222222202', 'individual', '陈宇',
 '{"Nature","Hiking","Photography"}',
 '{"English","Chinese"}',
 '{"Guilin","Yangshuo","Longsheng"}',
 5, 'verified',
 'Landscape photographer turned guide — I''ll take you to China''s most photogenic spots.',
 '{"https://images.unsplash.com/photo-1528164344705-47542687000d?w=600","https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600","https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600"}'),

('a1b2c3d4-3333-4a33-b333-333333333303', 'individual', '王芳',
 '{"History","Architecture","Silk Road"}',
 '{"English","Chinese","Japanese"}',
 '{"Xi''an","Dunhuang","Luoyang"}',
 6, 'verified',
 'History degree + 6 years guiding — bringing the Silk Road and Tang Dynasty back to life.',
 '{"https://images.unsplash.com/photo-1555990538-1e15b0e8b558?w=600","https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=600","https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600"}'),

('a1b2c3d4-4444-4a44-b444-444444444404', 'individual', '张美',
 '{"Food","Nightlife","Shopping"}',
 '{"English","Chinese"}',
 '{"Shanghai","Suzhou","Hangzhou"}',
 4, 'verified',
 'Shanghai foodie & night owl — from hidden soup dumpling spots to Bund rooftop bars.',
 '{"https://images.unsplash.com/photo-1537531383496-f4749b08f3ba?w=600","https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?w=600","https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=600"}'),

('a1b2c3d4-5555-4a55-b555-555555555505', 'individual', '刘洋',
 '{"Wildlife","Food","Tea Culture"}',
 '{"English","Chinese"}',
 '{"Chengdu","Leshan","Emeishan"}',
 7, 'verified',
 'Panda whisperer & tea connoisseur — Chengdu is not just a city, it''s a lifestyle.',
 '{"https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=600","https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=600","https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600"}'),

('a1b2c3d4-6666-4a66-b666-666666666606', 'individual', '赵婷',
 '{"Culture","Photography","Cycling"}',
 '{"English","Chinese","French"}',
 '{"Hangzhou","Suzhou","Shaoxing"}',
 3, 'verified',
 'West Lake sunrise chaser — guiding you through China''s most poetic landscapes.',
 '{"https://images.unsplash.com/photo-1529240168534-2b0f59b671b0?w=600","https://images.unsplash.com/photo-1480796927426-f609979314bd?w=600","https://images.unsplash.com/photo-1509909756405-be0199881695?w=600"}');

-- ============================================================
-- 4. 创建 tour_plans（旅游方案）
-- ============================================================
INSERT INTO public.tour_plans (id, guide_id, title, subtitle, description, cover_image_url, gallery_urls, destinations, itinerary, duration_days, max_group_size, price_cny, currency, price_breakdown, includes, excludes, highlights, tags, difficulty, status, view_count, booking_count) VALUES

-- Plan 1: Li Wei — Classic Beijing 3-Day
('f1a2b3c4-0001-4000-a000-000000000001',
 'a1b2c3d4-1111-4a11-b111-111111111101',
 'Classic Beijing — Imperial Grandeur',
 '3 days of emperors, hutongs & the Great Wall',
 'Discover Beijing''s imperial splendor and local charm. Walk through the Forbidden City at golden hour, get lost in hutong alleyways, and watch sunrise paint the Great Wall gold. This is the Beijing most tourists miss.',
 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800',
 '{"https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=800","https://images.unsplash.com/photo-1599707367812-042bfd7e5794?w=800","https://images.unsplash.com/photo-1584450150502-2795e9d0f662?w=800"}',
 '[{"city":"Beijing","spots":["Forbidden City","Jingshan Park","Nanluoguxiang"]},{"city":"Beijing","spots":["Mutianyu Great Wall","Hutong Courtyard"]},{"city":"Beijing","spots":["Temple of Heaven","Panjiayuan Market"]}]',
 '[{"day":1,"title":"Imperial Heart of Beijing","description":"Enter the Forbidden City through the Meridian Gate, climb Jingshan for a panoramic view, then wander Nanluoguxiang hutong for local snacks and crafts.","spots":["Forbidden City","Jingshan Park","Nanluoguxiang"],"meals":{"lunch":"Traditional Beijing noodles","dinner":"Peking Duck at a century-old restaurant"}},{"day":2,"title":"Sunrise at the Great Wall","description":"Early departure to Mutianyu — less crowded, more spectacular. Cable car up, toboggan down. Afternoon tea in a restored hutong courtyard.","spots":["Mutianyu Great Wall","Hutong Courtyard"],"meals":{"lunch":"Farmhouse feast near the Wall","dinner":"Hotpot in a hidden courtyard"}},{"day":3,"title":"Temple, Tea & Treasures","description":"Morning tai chi at Temple of Heaven, explore the Echo Wall. Afternoon at Panjiayuan antiques market — the real one, not the tourist trap.","spots":["Temple of Heaven","Panjiayuan Market"],"meals":{"lunch":"Dim sum brunch","dinner":"Farewell banquet"}}]',
 3, 8, 3200, 'CNY',
 '{"accommodation":1200,"meals":800,"transport":500,"guide_fee":700}',
 '{"English-speaking guide","Private transport","2 nights boutique hotel","All entrance fees","All meals","Great Wall cable car"}',
 '{"International flights","Travel insurance","Personal expenses","Tips"}',
 '{"Forbidden City golden hour tour","Sunrise at Mutianyu Great Wall","Hidden hutong courtyard visit","Peking Duck at a century-old restaurant"}',
 '{"Beijing","Great Wall","Forbidden City","Culture","History"}',
 'easy', 'published', 3200, 156),

-- Plan 2: Li Wei — Hidden Beijing Food Walk
('f1a2b3c4-0002-4000-a000-000000000002',
 'a1b2c3d4-1111-4a11-b111-111111111101',
 'Hidden Beijing — A Foodie''s Pilgrimage',
 '2 days of legendary street food & secret kitchens',
 'Forget the restaurants in guidebooks. This tour takes you through Beijing''s underground food scene — from 5am breakfast markets to midnight lamb skewer alleys. Come hungry, leave changed.',
 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=800',
 '{"https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800","https://images.unsplash.com/photo-1584450150502-2795e9d0f662?w=800"}',
 '[{"city":"Beijing","spots":["Qianmen Street","Guijie (Ghost Street)","Hutong Kitchens"]},{"city":"Beijing","spots":["Panjiayuan Breakfast","Temple of Heaven","Wangfujing"]}]',
 '[{"day":1,"title":"Street Food Marathon","description":"Start at Qianmen for jianbing and soy milk. Walk through hutongs tasting zhajiangmian, tanghulu, and baozi. Dinner on Ghost Street — Beijing''s legendary midnight food street.","spots":["Qianmen Street","Guijie (Ghost Street)","Hutong Kitchens"],"meals":{"lunch":"Hutong noodle crawl","dinner":"Ghost Street seafood feast"}},{"day":2,"title":"Morning Markets to Imperial Treats","description":"5am Panjiayuan breakfast with the locals. Then imperial-style pastries at a 200-year-old shop. Afternoon tea ceremony with Beijing snacks.","spots":["Panjiayuan Breakfast","Temple of Heaven","Wangfujing"],"meals":{"lunch":"Imperial court cuisine","dinner":"Farewell hotpot"}}]',
 2, 6, 1800, 'CNY',
 '{"meals":900,"guide_fee":500,"transport":400}',
 '{"English-speaking guide","All food tastings","Private transport","Tea ceremony"}',
 '{"Accommodation","International flights","Alcoholic drinks","Tips"}',
 '{"Ghost Street midnight food crawl","200-year-old imperial pastry shop","Hidden hutong kitchen access","Traditional tea ceremony"}',
 '{"Beijing","Food","Street Food","Culture"}',
 'easy', 'published', 2100, 89),

-- Plan 3: Chen Yu — Guilin & Yangshuo Photography
('f1a2b3c4-0003-4000-a000-000000000003',
 'a1b2c3d4-2222-4a22-b222-222222222202',
 'Guilin & Yangshuo — Through the Lens',
 '4 days of karst peaks, rice terraces & river sunrises',
 'China''s most photographed landscape, guided by a professional photographer. Sunrise over the Li River, golden hour at Longji rice terraces, and moonlit cycling through Yangshuo. Your Instagram will never be the same.',
 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800',
 '{"https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800","https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800"}',
 '[{"city":"Guilin","spots":["Elephant Trunk Hill","Reed Flute Cave"]},{"city":"Li River","spots":["Xingping","Yellow Cloth Shoal"]},{"city":"Yangshuo","spots":["Moon Hill","Yulong River"]},{"city":"Longsheng","spots":["Longji Rice Terraces"]}]',
 '[{"day":1,"title":"Guilin City Sights","description":"Arrive in Guilin, photograph Elephant Trunk Hill at sunset, explore the magical Reed Flute Cave with its neon-lit stalactites.","spots":["Elephant Trunk Hill","Reed Flute Cave"],"meals":{"dinner":"Guilin rice noodles"}},{"day":2,"title":"Li River Sunrise","description":"Pre-dawn boat to Xingping — the 20 yuan bill viewpoint. Photograph cormorant fishermen at sunrise. Afternoon bamboo raft on the Yulong River.","spots":["Xingping","Yellow Cloth Shoal","Yulong River"],"meals":{"lunch":"River fish feast","dinner":"Yangshuo beer fish"}},{"day":3,"title":"Yangshuo Adventures","description":"Cycle through karst valleys, photograph Moon Hill, sunset at the Big Banyan Tree. Evening at the Impression Sanjie Liu light show.","spots":["Moon Hill","Yulong River","Impression Sanjie Liu"],"meals":{"lunch":"Countryside farmhouse","dinner":"West Street food crawl"}},{"day":4,"title":"Longji Rice Terraces","description":"Drive to Longji, hike through layered rice terraces. Photograph the Dragons Backbone at golden hour before heading back.","spots":["Longji Rice Terraces"],"meals":{"lunch":"Zhuang minority cuisine","dinner":"Farewell dinner in Guilin"}}]',
 4, 6, 4100, 'CNY',
 '{"accommodation":1400,"meals":1000,"transport":800,"guide_fee":900}',
 '{"Photography guide","Private transport","3 nights hotel","All meals","Li River boat","Bamboo raft","Longji entrance fees"}',
 '{"International flights","Camera equipment","Travel insurance","Tips"}',
 '{"Li River sunrise from the 20-yuan viewpoint","Cormorant fishermen photography session","Longji Rice Terraces at golden hour","Impression Sanjie Liu light show"}',
 '{"Guilin","Yangshuo","Photography","Nature","Hiking"}',
 'moderate', 'published', 4100, 201),

-- Plan 4: Chen Yu — Zhangjiajie Avatar Mountains
('f1a2b3c4-0004-4000-a000-000000000004',
 'a1b2c3d4-2222-4a22-b222-222222222202',
 'Zhangjiajie — Avatar''s Floating Mountains',
 '3 days among the pillars that inspired Pandora',
 'Walk among the sandstone pillars that floated in Avatar. Glass bridges, cloud-sea viewpoints, and the world''s tallest outdoor elevator. This is China''s most otherworldly landscape.',
 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800',
 '{"https://images.unsplash.com/photo-1528164344705-47542687000d?w=800","https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800"}',
 '[{"city":"Zhangjiajie","spots":["Zhangjiajie National Forest Park","Golden Whip Stream"]},{"city":"Zhangjiajie","spots":["Yuanjiajie (Avatar Hallelujah Mountain)","Bailong Elevator"]},{"city":"Zhangjiajie","spots":["Tianmen Mountain","Glass Skywalk"]}]',
 '[{"day":1,"title":"Enter the Forest of Pillars","description":"Hike Golden Whip Stream through towering sandstone columns. Afternoon at Zhangjiajie National Forest Park — the inspiration for Avatar''s floating mountains.","spots":["Zhangjiajie National Forest Park","Golden Whip Stream"],"meals":{"lunch":"Mountain picnic","dinner":"Tujia minority cuisine"}},{"day":2,"title":"Avatar Hallelujah Mountain","description":"Take the Bailong Elevator (326m!) to Yuanjiajie. Stand where Avatar was conceived. Cross the First Bridge Under Heaven. Afternoon photography at Tianzi Mountain.","spots":["Yuanjiajie","Bailong Elevator","Tianzi Mountain"],"meals":{"lunch":"Mountain restaurant","dinner":"Local hotpot"}},{"day":3,"title":"Tianmen Mountain & The Gate to Heaven","description":"Ride the world''s longest cable car to Tianmen Mountain. Walk the glass skywalk clinging to the cliff. Descend through Tianmen Cave — the natural arch known as Heaven''s Gate.","spots":["Tianmen Mountain","Glass Skywalk","Tianmen Cave"],"meals":{"lunch":"Cliffside restaurant","dinner":"Farewell dinner"}}]',
 3, 8, 4500, 'CNY',
 '{"accommodation":1200,"meals":800,"transport":600,"guide_fee":800,"tickets":1100}',
 '{"Photography guide","Private transport","2 nights hotel","All meals","All park entrance fees","Bailong Elevator","Cable car tickets"}',
 '{"International flights","Travel insurance","Personal expenses","Tips"}',
 '{"Bailong Elevator — world''s tallest outdoor elevator","Avatar Hallelujah Mountain viewpoint","Tianmen Cave — Heaven''s Gate","Glass skywalk on Tianmen Mountain"}',
 '{"Zhangjiajie","Avatar","Nature","Adventure","Photography"}',
 'moderate', 'published', 4500, 234),

-- Plan 5: Wang Fang — Xi'an Ancient Capital
('f1a2b3c4-0005-4000-a000-000000000005',
 'a1b2c3d4-3333-4a33-b333-333333333303',
 'Xi''an — Echoes of the Silk Road',
 '3 days of terracotta warriors, city walls & Tang Dynasty nights',
 'Walk the same streets as Silk Road merchants 2,000 years ago. Stand face-to-face with 8,000 terracotta soldiers. Cycle atop China''s best-preserved city wall at sunset. Xi''an is where Chinese civilization began.',
 'https://images.unsplash.com/photo-1555990538-1e15b0e8b558?w=800',
 '{"https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=800","https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800"}',
 '[{"city":"Xi''an","spots":["Terracotta Army","Huaqing Palace"]},{"city":"Xi''an","spots":["Ancient City Wall","Muslim Quarter","Bell Tower"]},{"city":"Xi''an","spots":["Shaanxi History Museum","Big Wild Goose Pagoda","Tang Dynasty Show"]}]',
 '[{"day":1,"title":"The Terracotta Army","description":"Morning visit to the pit where 8,000 warriors stood guard for 2,200 years. Each face is unique. Afternoon at Huaqing Palace — hot springs of the legendary Yang Guifei.","spots":["Terracotta Army","Huaqing Palace"],"meals":{"lunch":"Biangbiang noodles","dinner":"Muslim Quarter street food"}},{"day":2,"title":"Walls, Bells & Barbecue","description":"Cycle the 14km ancient city wall at golden hour. Explore the Muslim Quarter''s bustling food scene. Evening view from the Bell Tower lit up at night.","spots":["Ancient City Wall","Muslim Quarter","Bell Tower"],"meals":{"lunch":"Roujiamo (Chinese hamburger)","dinner":"Xi''an BBQ feast"}},{"day":3,"title":"Tang Dynasty Splendor","description":"Explore Shaanxi History Museum — 3,700 years of artifacts. Afternoon at Big Wild Goose Pagoda. Evening Tang Dynasty music and dance show with a royal banquet.","spots":["Shaanxi History Museum","Big Wild Goose Pagoda","Tang Dynasty Show"],"meals":{"lunch":"Dumpling banquet","dinner":"Tang Dynasty royal banquet"}}]',
 3, 10, 3600, 'CNY',
 '{"accommodation":1100,"meals":900,"transport":500,"guide_fee":600,"tickets":500}',
 '{"English-speaking guide","Private transport","2 nights hotel","All meals","Terracotta Army tickets","City Wall bike rental","Tang Dynasty show tickets"}',
 '{"International flights","Travel insurance","Personal expenses","Tips"}',
 '{"Face-to-face with 8,000 Terracotta Warriors","Sunset cycling on the Ancient City Wall","Muslim Quarter food adventure","Tang Dynasty royal banquet & show"}',
 '{"Xi''an","Terracotta","Silk Road","History","Culture"}',
 'easy', 'published', 3600, 178),

-- Plan 6: Zhang Mei — Shanghai Nights
('f1a2b3c4-0006-4000-a000-000000000006',
 'a1b2c3d4-4444-4a44-b444-444444444404',
 'Shanghai — Where Tradition Meets Tomorrow',
 '2 days of skyline magic, hidden food & nightlife',
 'Shanghai is a city that never stops reinventing itself. I''ll take you from 1920s art deco lanes to the world''s most stunning skyline, with the best food stops in between. Day or night, this city delivers.',
 'https://images.unsplash.com/photo-1537531383496-f4749b08f3ba?w=800',
 '{"https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?w=800","https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=800"}',
 '[{"city":"Shanghai","spots":["The Bund","Yu Garden","French Concession"]},{"city":"Shanghai","spots":["Tianzifang","Lujiazui","Bar Rouge"]}]',
 '[{"day":1,"title":"Old Shanghai Soul","description":"Start at Yu Garden — a Ming Dynasty masterpiece hidden in the city. Walk the French Concession''s tree-lined streets. Sunset cocktails on the Bund watching Pudong light up.","spots":["The Bund","Yu Garden","French Concession"],"meals":{"lunch":"Xiaolongbao at the original Din Tai Fung","dinner":"Shanghainese braised pork & hairy crab"}},{"day":2,"title":"Future Shanghai","description":"Morning at Tianzifang art alley — galleries in old lilong lanes. Afternoon at the top of Shanghai Tower (632m). Night out on the town — rooftop bars with killer skyline views.","spots":["Tianzifang","Lujiazui","Bar Rouge"],"meals":{"lunch":"Hidden noodle shop in Tianzifang","dinner":"Rooftop dinner with Bund views"}}]',
 2, 8, 2800, 'CNY',
 '{"accommodation":800,"meals":800,"transport":400,"guide_fee":500,"tickets":300}',
 '{"English-speaking guide","Private transport","1 night boutique hotel","All meals","Shanghai Tower observation deck","Tea ceremony at Yu Garden"}',
 '{"International flights","Travel insurance","Alcoholic drinks","Tips"}',
 '{"Bund sunset cocktail with Pudong skyline","Shanghai Tower — 632m above the city","Hidden French Concession café crawl","Rooftop bar with killer night views"}',
 '{"Shanghai","Nightlife","Food","Skyline","Modern China"}',
 'easy', 'published', 2800, 98),

-- Plan 7: Liu Yang — Chengdu Panda & Spice
('f1a2b3c4-0007-4000-a000-000000000007',
 'a1b2c3d4-5555-4a55-b555-555555555505',
 'Chengdu — Pandas, Tea & Burning Tongues',
 '3 days of giant pandas, ancient tea houses & numbing spice',
 'Chengdu doesn''t rush — and neither will you. Wake up with baby pandas, sip tea in a 100-year-old teahouse, then sweat through a Sichuan hotpot that will rewire your taste buds. This is the good life, Chinese style.',
 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=800',
 '{"https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=800","https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800"}',
 '[{"city":"Chengdu","spots":["Chengdu Research Base","Jinli Street","Sichuan Opera"]},{"city":"Chengdu","spots":["People''s Park Teahouse","Wenshu Monastery","Hotpot District"]},{"city":"Leshan","spots":["Leshan Giant Buddha","Qingyi River"]}]',
 '[{"day":1,"title":"Morning with Pandas","description":"Early access to the Panda Base before the crowds. Watch baby pandas tumble and adult pandas demolish bamboo. Evening at Jinli ancient street and Sichuan Opera face-changing show.","spots":["Chengdu Research Base","Jinli Street","Sichuan Opera"],"meals":{"lunch":"Mapo tofu at the original Chen''s","dinner":"Sichuan hotpot challenge"}},{"day":2,"title":"Tea, Temples & Spice","description":"Morning at People''s Park teahouse — Chengdu''s living room. Afternoon at Wenshu Monastery for vegetarian lunch and incense. Evening hotpot that will change your life.","spots":["People''s Park Teahouse","Wenshu Monastery","Hotpot District"],"meals":{"lunch":"Monastery vegetarian feast","dinner":"Numbing & spicy hotpot experience"}},{"day":3,"title":"The Giant Buddha of Leshan","description":"Day trip to the 71m Giant Buddha carved into a cliff. Boat view from the river, then hike to stand at his toes. Farewell dinner back in Chengdu.","spots":["Leshan Giant Buddha","Qingyi River"],"meals":{"lunch":"Leshan sweet duck & bobo chicken","dinner":"Farewell Sichuan banquet"}}]',
 3, 8, 3400, 'CNY',
 '{"accommodation":1000,"meals":900,"transport":600,"guide_fee":600,"tickets":300}',
 '{"English-speaking guide","Private transport","2 nights hotel","All meals","Panda Base early access","Sichuan Opera tickets","Leshan boat ticket"}',
 '{"International flights","Travel insurance","Personal expenses","Tips"}',
 '{"Early access baby panda encounter","100-year-old teahouse experience","Sichuan face-changing opera","71m Leshan Giant Buddha from the river"}',
 '{"Chengdu","Pandas","Sichuan Food","Tea","Culture"}',
 'easy', 'published', 3400, 167),

-- Plan 8: Zhao Ting — Hangzhou Poetry
('f1a2b3c4-0008-4000-a000-000000000008',
 'a1b2c3d4-6666-4a66-b666-666666666606',
 'Hangzhou — Poems on Water',
 '3 days of misty lakes, dragon well tea & silk roads',
 'Hangzhou has inspired Chinese poets for a thousand years. Cycle around West Lake at dawn, drink tea where emperors drank, and wander through bamboo forests that seem designed by an artist. This is China at its most beautiful.',
 'https://images.unsplash.com/photo-1529240168534-2b0f59b671b0?w=800',
 '{"https://images.unsplash.com/photo-1480796927426-f609979314bd?w=800","https://images.unsplash.com/photo-1509909756405-be0199881695?w=800"}',
 '[{"city":"Hangzhou","spots":["West Lake","Lingyin Temple"]},{"city":"Hangzhou","spots":["Longjing Tea Village","Nine Creeks","Bamboo Forest"]},{"city":"Hangzhou","spots":["Hefang Street","China Silk Museum","Grand Canal"]}]',
 '[{"day":1,"title":"Misty West Lake & Ancient Temple","description":"Dawn walk along Su Causeway as mist rises off West Lake. Visit Lingyin Temple — one of China''s oldest Buddhist temples with caves carved 1,600 years ago.","spots":["West Lake","Lingyin Temple"],"meals":{"lunch":"West Lake vinegar fish","dinner":"Dongpo pork & beggar''s chicken"}},{"day":2,"title":"Dragon Well Tea & Bamboo Dreams","description":"Morning at Longjing Tea Village — pick and roast your own Dragon Well tea with a master. Afternoon hike through Nine Creeks and into bamboo forests straight out of Crouching Tiger.","spots":["Longjing Tea Village","Nine Creeks","Bamboo Forest"],"meals":{"lunch":"Tea-pairing lunch in the village","dinner":"Farmhouse dinner in the hills"}},{"day":3,"title":"Silk, Canals & Farewell","description":"Explore Hefang Street for traditional crafts. Visit the China Silk Museum to see how Hangzhou silk shaped world trade. Sunset boat ride on the Grand Canal — 2,500 years old and still flowing.","spots":["Hefang Street","China Silk Museum","Grand Canal"],"meals":{"lunch":"Silk Road-inspired feast","dinner":"Canalside farewell dinner"}}]',
 3, 6, 3000, 'CNY',
 '{"accommodation":1000,"meals":800,"transport":400,"guide_fee":500,"tickets":300}',
 '{"English-speaking guide","Private transport","2 nights hotel","All meals","Tea picking & roasting experience","Lingyin Temple tickets","Grand Canal boat ride"}',
 '{"International flights","Travel insurance","Personal expenses","Tips"}',
 '{"Dawn walk on Su Causeway through the mist","Pick and roast your own Dragon Well tea","Nine Creeks bamboo forest hike","Sunset on the 2,500-year-old Grand Canal"}',
 '{"Hangzhou","Tea","Culture","Nature","Photography"}',
 'easy', 'published', 3000, 134),

-- Plan 9: Wang Fang — Dunhuang Silk Road
('f1a2b3c4-0009-4000-a000-000000000009',
 'a1b2c3d4-3333-4a33-b333-333333333303',
 'Dunhuang — Gateway to the Silk Road',
 '3 days of desert caves, camel caravans & starlit dunes',
 'Stand where Silk Road caravans rested for thousands of years. Explore the Mogao Caves — 492 temples filled with 1,000 years of Buddhist art. Ride camels across singing sand dunes at sunset. Sleep under a billion stars in the Gobi Desert.',
 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=800',
 '{"https://images.unsplash.com/photo-1555990538-1e15b0e8b558?w=800","https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800"}',
 '[{"city":"Dunhuang","spots":["Mogao Caves","Mingsha Shan"]},{"city":"Dunhuang","spots":["Yumen Pass","Yardang National Geopark"]},{"city":"Dunhuang","spots":["Crescent Lake","Shazhou Night Market"]}]',
 '[{"day":1,"title":"The Thousand Buddha Caves","description":"Morning at the legendary Mogao Caves — 492 cave temples with murals spanning 1,000 years. Afternoon sunset camel ride across Mingsha Shan singing sand dunes.","spots":["Mogao Caves","Mingsha Shan"],"meals":{"lunch":"Silk Road flatbread & lamb","dinner":"Desert campfire dinner"}},{"day":2,"title":"Jade Gate & the Wind City","description":"Drive to Yumen Pass — the gateway where Silk Road merchants entered the wilderness. Afternoon at Yardang National Geopark — wind-carved formations that look like an alien planet.","spots":["Yumen Pass","Yardang National Geopark"],"meals":{"lunch":"Picnic at Yumen Pass","dinner":"Uyghur cuisine in Dunhuang"}},{"day":3,"title":"Crescent Moon & Night Markets","description":"Morning at Crescent Lake — a desert oasis that has survived 2,000 years. Afternoon at Shazhou Night Market for silk, jade, and street food. Farewell under the desert stars.","spots":["Crescent Lake","Shazhou Night Market"],"meals":{"lunch":"Oasis-side noodles","dinner":"Farewell Silk Road feast"}}]',
 3, 6, 5200, 'CNY',
 '{"accommodation":1400,"meals":1000,"transport":1200,"guide_fee":800,"tickets":800}',
 '{"English-speaking guide","Private transport","2 nights hotel","All meals","Mogao Cave tickets","Camel ride","Desert camping experience"}',
 '{"International flights","Travel insurance","Personal expenses","Tips"}',
 '{"Mogao Caves — 1,000 years of Buddhist art","Sunset camel ride across singing sand dunes","Yardang — the alien planet on Earth","Stargazing in the Gobi Desert"}',
 '{"Dunhuang","Silk Road","Desert","History","Adventure"}',
 'moderate', 'published', 5200, 89),

-- Plan 10: Liu Yang — Emeishan Sacred Mountain
('f1a2b3c4-0010-4000-a000-000000000010',
 'a1b2c3d4-5555-4a55-b555-555555555505',
 'Emeishan — Summit of the Sacred',
 '2 days of Buddhist peaks, monkey encounters & sea of clouds',
 'One of China''s Four Sacred Buddhist Mountains. Hike through ancient forests, encounter wild monkeys, and reach the Golden Summit at 3,099m where clouds part to reveal a sea of gold. Spiritual, physical, unforgettable.',
 'https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=800',
 '{"https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=800","https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800"}',
 '[{"city":"Emeishan","spots":["Baoguo Temple","Qingyin Pavilion","Monkey Zone"]},{"city":"Emeishan","spots":["Golden Summit","Huazang Temple","Sea of Clouds"]}]',
 '[{"day":1,"title":"Temples & Monkeys","description":"Start at Baoguo Temple, hike through ancient forest to Qingyin Pavilion — where two streams meet in perfect harmony. Navigate the famous monkey zone (they''re cheeky but fun).","spots":["Baoguo Temple","Qingyin Pavilion","Monkey Zone"],"meals":{"lunch":"Temple vegetarian lunch","dinner":"Monastery dinner"}},{"day":2,"title":"Golden Summit & Sea of Clouds","description":"Pre-dawn ascent to the Golden Summit at 3,099m. Watch the sun rise above a sea of clouds. Visit the golden statue of Samantabhadra. Descend through mossy trails.","spots":["Golden Summit","Huazang Temple","Sea of Clouds"],"meals":{"lunch":"Summit noodle soup","dinner":"Farewell dinner in Emeishan town"}}]',
 2, 6, 2400, 'CNY',
 '{"accommodation":600,"meals":500,"transport":400,"guide_fee":500,"tickets":400}',
 '{"English-speaking guide","Private transport","1 night temple lodge","All meals","Emeishan entrance tickets","Cable car tickets"}',
 '{"International flights","Travel insurance","Personal expenses","Tips"}',
 '{"Sunrise at the 3,099m Golden Summit","Wild monkey encounters on the trail","Temple lodge overnight experience","Sea of clouds from the summit"}',
 '{"Emeishan","Buddhism","Hiking","Nature","Sacred"}',
 'challenging', 'published', 2400, 76);


-- ============================================================
-- 5. 创建 posts（内容帖子）
-- ============================================================
INSERT INTO public.posts (id, author_id, post_type, title, description, media_urls, destination, tags, likes_count, comments_count, favorites_count, shares_count, view_count, status, linked_plan_id) VALUES

-- Post 1: Li Wei — Great Wall Sunrise
('e1a2b3c4-0001-4000-e000-000000000001',
 'a1b2c3d4-1111-4a11-b111-111111111101',
 'image', 'Sunrise at the Great Wall — Mutianyu at 5:47 AM',
 'The moment the sun breaks over the Mutianyu section, every brick glows gold. I''ve seen this hundreds of times and it still gives me chills. Pro tip: skip Badaling, come here. Fewer people, better views, same Wall.',
 '{"https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800"}',
 'Beijing', '{"Great Wall","Sunrise","Photography","Beijing"}', 3200, 156, 890, 234, 15600, 'published',
 'f1a2b3c4-0001-4000-a000-000000000001'),

-- Post 2: Chen Yu — Li River
('e1a2b3c4-0002-4000-e000-000000000002',
 'a1b2c3d4-2222-4a22-b222-222222222202',
 'image', 'Li River at dawn — the scene on your 20 yuan bill',
 'This is the exact viewpoint printed on China''s 20 yuan note. But no bill can capture the mist rolling off the water at 6am, the silence broken only by cormorant fishermen. Some things you have to see with your own eyes.',
 '{"https://images.unsplash.com/photo-1528164344705-47542687000d?w=800"}',
 'Guilin', '{"Li River","Guilin","Photography","Sunrise"}', 2890, 134, 720, 198, 13400, 'published',
 'f1a2b3c4-0003-4000-a000-000000000003'),

-- Post 3: Zhang Mei — Shanghai Bund Night
('e1a2b3c4-0003-4000-e000-000000000003',
 'a1b2c3d4-4444-4a44-b444-444444444404',
 'image', 'Shanghai Bund at midnight — when the city puts on a show',
 'Every night at 7pm, Pudong lights up like a sci-fi movie. The Bund across the river is the best seat in the house. But the real magic? Finding a hidden rooftop bar where it''s just you, the skyline, and a cocktail.',
 '{"https://images.unsplash.com/photo-1537531383496-f4749b08f3ba?w=800"}',
 'Shanghai', '{"Shanghai","Bund","Nightlife","Skyline"}', 2560, 98, 650, 167, 12300, 'published',
 'f1a2b3c4-0006-4000-a000-000000000006'),

-- Post 4: Wang Fang — Terracotta Warriors
('e1a2b3c4-0004-4000-e000-000000000004',
 'a1b2c3d4-3333-4a33-b333-333333333303',
 'image', 'Face to face with 8,000 warriors — Xi''an Terracotta Army',
 '2,200 years ago, Emperor Qin buried an entire army to protect him in the afterlife. Each warrior has a unique face — no two are alike. Standing in Pit 1, surrounded by thousands of them, is one of the most humbling experiences on Earth.',
 '{"https://images.unsplash.com/photo-1555990538-1e15b0e8b558?w=800"}',
 'Xi''an', '{"Terracotta","Xi''an","History","Culture"}', 3100, 145, 820, 210, 14800, 'published',
 'f1a2b3c4-0005-4000-a000-000000000005'),

-- Post 5: Liu Yang — Baby Pandas
('e1a2b3c4-0005-4000-e000-000000000005',
 'a1b2c3d4-5555-4a55-b555-555555555505',
 'image', 'Baby pandas at the Chengdu Research Base — impossible not to smile',
 'Every morning I watch these little furballs tumble over each other, and every morning I smile like it''s the first time. Fun fact: baby pandas poop up to 40 times a day. Cute AND productive.',
 '{"https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=800"}',
 'Chengdu', '{"Pandas","Chengdu","Wildlife","Cute"}', 5200, 289, 1400, 345, 25600, 'published',
 'f1a2b3c4-0007-4000-a000-000000000007'),

-- Post 6: Zhao Ting — West Lake Mist
('e1a2b3c4-0006-4000-e000-000000000006',
 'a1b2c3d4-6666-4a66-b666-666666666606',
 'image', 'West Lake at dawn — where Chinese poetry was born',
 'Su Shi wrote about this lake 1,000 years ago: "West Lake compares to Xi Shi, always beautiful whether in light makeup or heavy." Standing here at 5:30am, mist rising, pagodas reflected — you understand exactly what he meant.',
 '{"https://images.unsplash.com/photo-1529240168534-2b0f59b671b0?w=800"}',
 'Hangzhou', '{"West Lake","Hangzhou","Poetry","Photography"}', 2100, 112, 580, 145, 10200, 'published',
 'f1a2b3c4-0008-4000-a000-000000000008'),

-- Post 7: Chen Yu — Longji Rice Terraces
('e1a2b3c4-0007-4000-e000-000000000007',
 'a1a2b3d4-2222-4a22-b222-222222222202',
 'image', 'Longji Rice Terraces at golden hour — the Dragon''s Backbone',
 '650 years ago, the Zhuang people carved these terraces into the mountains by hand. From above, they look like a dragon''s scales. At golden hour, they glow like molten gold. Some views are worth every step of the climb.',
 '{"https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800"}',
 'Guilin', '{"Rice Terraces","Longji","Photography","Nature"}', 1800, 89, 480, 123, 8900, 'published',
 'f1a2b3c4-0003-4000-a000-000000000003'),

-- Post 8: Zhang Mei — Xiaolongbao
('e1a2b3c4-0008-4000-e000-000000000008',
 'a1b2c3d4-4444-4a44-b444-444444444404',
 'image', 'The perfect xiaolongbao — Shanghai''s soup dumpling art',
 '18 folds. That''s the standard for a proper xiaolongbao. The wrapper is thin enough to see the soup inside, thick enough to hold it. Bite the top, sip the broth, dip in black vinegar with ginger. Heaven in one bite.',
 '{"https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=800"}',
 'Shanghai', '{"Xiaolongbao","Food","Shanghai","Dumplings"}', 4100, 234, 1100, 290, 20100, 'published',
 'f1a2b3c4-0006-4000-a000-000000000006'),

-- Post 9: Wang Fang — Dunhuang Desert
('e1a2b3c4-0009-4000-e000-000000000009',
 'a1b2c3d4-3333-4a33-b333-333333333303',
 'image', 'Singing sand dunes of Dunhuang — where the desert hums',
 'When the wind blows across Mingsha Shan, the sand sings. Literally. It produces a low humming sound that echoes across the dunes. Ride a camel at sunset, listen to the desert hum, and feel the Silk Road come alive.',
 '{"https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=800"}',
 'Dunhuang', '{"Dunhuang","Silk Road","Desert","Adventure"}', 2300, 108, 610, 156, 11200, 'published',
 'f1a2b3c4-0009-4000-a000-000000000009'),

-- Post 10: Liu Yang — Sichuan Hotpot
('e1a2b3c4-0010-4000-e000-000000000010',
 'a1b2c3d4-5555-4a55-b555-555555555505',
 'image', 'Sichuan hotpot — the meal that rewires your brain',
 'Chili oil, Sichuan peppercorns, beef tripe, duck blood — ingredients that sound scary, taste transcendent. The numbing (ma) and spicy (la) sensation is literally addictive. Your tongue will tingle for hours. You will want more.',
 '{"https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=800"}',
 'Chengdu', '{"Hotpot","Sichuan","Food","Spicy"}', 3800, 201, 980, 267, 18700, 'published',
 'f1a2b3c4-0007-4000-a000-000000000007');


-- ============================================================
-- 恢复 FK 检查
-- ============================================================
SET session_replication_role = 'DEFAULT';

-- Done! 6 guides, 10 plans, 10 posts seeded.
