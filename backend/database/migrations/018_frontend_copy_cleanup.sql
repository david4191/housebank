-- 018: Refresh the first FAQ answer and remove em dashes from public site copy.
--
-- Run once against each database:
--   mysql -u <db_user> -p <db_name> < database/migrations/018_frontend_copy_cleanup.sql

UPDATE help_topics
SET answer = 'HouseBank helps people find homes to rent or buy and gives realtors, property owners, and companies a place to list them. You can also browse property investment opportunities.'
WHERE question = 'What is HouseBank?';

UPDATE help_topics
SET question = REPLACE(question, '—', ', '),
    answer = REPLACE(answer, '—', ', ')
WHERE question LIKE '%—%' OR answer LIKE '%—%';

UPDATE static_pages
SET title = REPLACE(title, '—', ', '),
    content_html = REPLACE(content_html, '—', ', ')
WHERE title LIKE '%—%' OR content_html LIKE '%—%';

UPDATE static_pages
SET title = 'HouseBank Cover for Listed Properties'
WHERE slug = 'housebank-cover'
  AND title = 'HouseBank Cover, For Listed Properties';

UPDATE static_pages
SET title = 'HouseBank Cover for Users'
WHERE slug = 'housebank-cover-users'
  AND title = 'HouseBank Cover, For Users';

UPDATE static_pages
SET content_html =
  REPLACE(
    REPLACE(
      REPLACE(
        REPLACE(content_html,
          'quickly, you can also reach out to them directly.',
          'quickly. You can also reach out to them directly.'),
        '1. Document the issue, take clear photos or videos of the problem, if possible.',
        '1. Document the issue. If possible, take clear photos or videos of the problem.'),
      '2. Contact your host, reach out within 72 hours of discovering the issue and give them a chance to resolve it.',
      '2. Contact your host within 72 hours of discovering the issue and give them a chance to resolve it.'),
    '3. Reach out to us, if the issue doesn''t get resolved or the realtor doesn''t respond, contact HouseBank support as soon as possible.',
    '3. Reach out to us if the issue isn''t resolved or the realtor doesn''t respond.')
WHERE slug IN ('housebank-cover', 'housebank-cover-users');

UPDATE page_content_items
SET title = REPLACE(title, '—', ', '),
    subtitle = REPLACE(subtitle, '—', ', '),
    description = REPLACE(description, '—', ', ')
WHERE title LIKE '%—%' OR subtitle LIKE '%—%' OR description LIKE '%—%';

UPDATE page_content_items
SET description = 'At HouseBank, we are your partners in finding the perfect space to live, work, and thrive.'
WHERE page = 'about'
  AND section = 'about-hero'
  AND sort_order = 1
  AND description LIKE 'At HouseBank, we pride ourselves on being more than just a real estate agency%';

UPDATE page_content_items
SET extra = JSON_SET(
  extra,
  '$.additionalText',
  REPLACE(JSON_UNQUOTE(JSON_EXTRACT(extra, '$.additionalText')), '—', ', ')
)
WHERE JSON_UNQUOTE(JSON_EXTRACT(extra, '$.additionalText')) LIKE '%—%';

UPDATE page_content_items
SET extra = JSON_SET(
  extra,
  '$.additionalText',
  REPLACE(
    JSON_UNQUOTE(JSON_EXTRACT(extra, '$.additionalText')),
    'At HouseBank Real Estate, we don''t just sell properties, we help you build a foundation for your future. Let''s find your dream home today!',
    'At HouseBank Real Estate, we help you build a foundation for your future. Let''s find your dream home today!'
  )
)
WHERE page = 'about'
  AND section = 'about-bottom-features'
  AND sort_order = 1
  AND JSON_UNQUOTE(JSON_EXTRACT(extra, '$.additionalText')) LIKE '%we don''t just sell properties%';
