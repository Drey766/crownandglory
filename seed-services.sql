-- ============================================================
-- seed-services.sql — 24 salon services
-- Run AFTER supabase-schema.sql
-- ============================================================

INSERT INTO public.services (name, description, category, duration_min, price, deposit) VALUES

-- Wig Services
('Wig Installation',           'Professional installation of your wig with glue or glueless method. Includes baby hair styling and bleaching of knots.',   'wig-services',    60,  1500, 500),
('Wig Washing & Conditioning', 'Deep wash, condition, and detangle your wig to restore its natural bounce and shine.',                                     'wig-services',    45,   800,   0),
('Wig Styling',                'Custom styling of your wig — curls, waves, straight, or any style you desire.',                                            'wig-services',    60,  1200,   0),
('Wig Coloring',               'Professional color application on your wig. Includes toning and treatment.',                                               'wig-services',   120,  3500, 1000),
('Wig Revamp',                 'Full wig restoration — wash, condition, re-style, and minor repairs.',                                                     'wig-services',    90,  2000, 500),
('Wig Customization',          'Cut lace, bleach knots, pluck hairline, and customize the wig to fit your head perfectly.',                                'wig-services',    75,  2500, 500),

-- Hair Washing & Styling
('Hair Wash & Blow Dry',       'Includes shampoo, deep conditioning treatment, and blow dry to a smooth finish.',                                          'washing-styling',  60,  1200,   0),
('Hair Wash & Style',          'Shampoo, condition, blow dry, and finish styling of your choice.',                                                         'washing-styling',  90,  1800,   0),
('Hair Treatment',             'Deep conditioning, protein treatment, or keratin treatment to restore hair health.',                                        'washing-styling',  75,  2500, 500),
('Scalp Treatment',            'Scalp detox, massage, and treatment for dandruff, dryness, or hair loss.',                                                 'washing-styling',  45,  1500,   0),

-- Braiding & Plaiting
('Box Braids',                 'Classic box braids in your preferred size — small, medium, or large.',                                                     'braiding',        240,  3500, 1000),
('Knotless Braids',            'Feed-in knotless braids for a more natural look and less tension on the scalp.',                                           'braiding',        300,  4500, 1500),
('Cornrows',                   'Straight-back cornrows or patterned cornrows in your preferred style.',                                                    'braiding',         90,  1500,   0),
('Fulani Braids',              'Fulani-inspired braid pattern with cornrows and hanging braids.',                                                           'braiding',        180,  3000, 1000),
('Twists',                     'Senegalese twists, Marley twists, or passion twists in your preferred size.',                                              'braiding',        240,  3500, 1000),
('Crochet Braids',             'Crochet installation with your choice of hair texture and style.',                                                         'braiding',        120,  2500, 500),

-- Coloring & Treatments
('Full Hair Color',            'Single process full hair color application. Consultation included.',                                                       'coloring',        120,  4000, 1500),
('Highlights & Balayage',      'Partial or full highlights, balayage, or ombre effect.',                                                                   'coloring',        150,  5500, 2000),
('Toning',                     'Correct brassiness and refresh your existing color with a toner.',                                                         'coloring',         45,  1500,   0),
('Relaxer Application',        'Professional relaxer application with neutralizing shampoo and deep condition.',                                            'coloring',         90,  2000,   0),

-- Lash Services
('Lash Application',           'Professional application of strip lashes or individual lash clusters.',                                                    'lashes',           30,   800,   0),
('Lash Lift & Tint',           'Semi-permanent lash lift with optional tint for naturally longer-looking lashes.',                                         'lashes',           60,  2500, 500),
('Lash Extensions',            'Full set of classic, hybrid, or volume lash extensions.',                                                                  'lashes',           90,  4000, 1500),
('Lash Removal',               'Safe professional removal of lash extensions.',                                                                            'lashes',           30,   500,   0);

SELECT category, name, price FROM public.services ORDER BY category, name;
