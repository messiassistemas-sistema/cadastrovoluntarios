-- Add dating information columns to volunteers table
ALTER TABLE volunteers
ADD COLUMN IF NOT EXISTS dating BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS partner_religion TEXT;

-- Comment on columns
COMMENT ON COLUMN volunteers.dating IS 'Indicates if the volunteer is currently dating';
COMMENT ON COLUMN volunteers.partner_religion IS 'Religion of the partner if dating';
