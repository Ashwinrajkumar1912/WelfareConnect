/*
# Add application URLs to schemes catalog

## Overview
Populates the `application_url` column for all 15 seeded welfare schemes with
real government portal URLs so users can apply directly from the app.

## Security
No security changes — UPDATE runs as authenticated (deploy session).

## Notes
1. Idempotent: re-running updates the same rows to the same URLs.
2. URLs point to official government scheme portals where users can apply
   or learn how to apply.
*/

UPDATE schemes SET application_url = 'https://pmjay.gov.in' WHERE title = 'National Health Insurance';
UPDATE schemes SET application_url = 'https://wcd.nic.in/schemes/maternal-benefit-programme' WHERE title = 'Maternity Benefit Program';
UPDATE schemes SET application_url = 'https://dfpd.gov.in' WHERE title = 'Public Distribution Food Security';
UPDATE schemes SET application_url = 'https://pmaymis.gov.in' WHERE title = 'Affordable Housing for All';
UPDATE schemes SET application_url = 'https://nrega.nic.in' WHERE title = 'Rural Employment Guarantee';
UPDATE schemes SET application_url = 'https://education.gov.in/rte' WHERE title = 'Primary Education Access';
UPDATE schemes SET application_url = 'https://scholarships.gov.in' WHERE title = 'Higher Education Scholarship';
UPDATE schemes SET application_url = 'https://nsap.nic.in' WHERE title = 'Senior Citizen Pension';
UPDATE schemes SET application_url = 'https://disabilityaffairs.gov.in' WHERE title = 'Disability Support Allowance';
UPDATE schemes SET application_url = 'https://pmfby.gov.in' WHERE title = 'Crop Insurance Scheme';
UPDATE schemes SET application_url = 'https://nrlm.gov.in' WHERE title = 'Women Self-Help Group Loan';
UPDATE schemes SET application_url = 'https://dbtbharat.gov.in' WHERE title = 'Direct Cash Transfer';
UPDATE schemes SET application_url = 'https://pmkvyofficial.org' WHERE title = 'Skill Development Training';
UPDATE schemes SET application_url = 'https://pmkisan.gov.in' WHERE title = 'Farm Loan Waiver';
UPDATE schemes SET application_url = 'https://nsap.nic.in' WHERE title = 'Widow Pension Scheme';
