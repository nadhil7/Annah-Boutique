ALTER TABLE product_variants
  ADD COLUMN IF NOT EXISTS colour_hex text;

ALTER TABLE product_variants
  DROP CONSTRAINT IF EXISTS product_variants_colour_hex_check;

ALTER TABLE product_variants
  ADD CONSTRAINT product_variants_colour_hex_check
  CHECK (colour_hex IS NULL OR colour_hex ~ '^#[0-9A-Fa-f]{6}(,#[0-9A-Fa-f]{6})?$');
