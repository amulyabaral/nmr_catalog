-- Clear existing data before inserting new data
DELETE FROM data_points;

-- Insert new data based on the provided table and _reusables.yaml hierarchy
INSERT INTO data_points (
    data_source_id,
    resource_type,      -- Level 1
    category,           -- Level 2
    subcategory,        -- Level 3
    data_type,          -- Level 4
    level5,             -- Level 5
    data_format,
    data_resolution,
    repository,
    repository_url,
    data_description,
    keywords,
    last_updated,
    contact_information,
    metadata,
    country,
    domain
) VALUES

-- Denmark - Human Health
('SYS-SURV-DANMAP-DK', 'Systems', 'surveillance_network', 'pathogen_tracking_systems', 'clinical_isolate_registry', NULL, 'Web Platform/Database', 'national', 'DANMAP',
'https://www.danmap.org/', 'Danish Integrated Antimicrobial Resistance Monitoring and Research Programme. Monitors antimicrobial consumption and resistance in humans and animals.',
'surveillance, AMR, human, animal, Denmark, monitoring, consumption, resistance', '2024-01-01', 'danmap@ssi.dk',
'{"title": "DANMAP", "institution": "SSI/DTU", "geographic_coverage": "Denmark", "license": "Public Access", "version": "Annual Reports"}',
'Denmark', 'Human'), -- Primary Domain: Human

('ENT-RESC-COPSAC-DK', 'Entities', 'research_consortia', 'academic_partnerships', NULL, NULL, 'Website', 'cohort', 'COPSAC',
'https://copsac.com/', 'Copenhagen Prospective Studies on Asthma in Childhood. Research includes microbiome and potential links to health outcomes.',
'research, cohort, asthma, microbiome, children, Denmark, human', '2024-01-01', 'info@copsac.com',
'{"title": "COPSAC - Copenhagen Prospective Studies on Asthma in Childhood", "institution": "COPSAC", "geographic_coverage": "Denmark", "license": "N/A", "version": "Ongoing"}',
'Denmark', 'Human'),

-- Denmark - Animal Health / Food (DANMAP already added, covers Animal too)

-- Denmark - Environment
('ENT-GOV-DEPA-DK', 'Entities', 'funding_bodies', 'government_agencies', NULL, NULL, 'Website', 'national', 'Danish Environmental Protection Agency',
'https://eng.mst.dk/', 'The Danish Environmental Protection Agency (Miljøstyrelsen). Involved in environmental regulations and monitoring.',
'environment, agency, government, Denmark, regulation, monitoring', '2024-01-01', 'mst@mst.dk',
'{"title": "Danish Environmental Protection Agency", "institution": "Miljøstyrelsen", "geographic_coverage": "Denmark", "license": "Government Publication", "version": "N/A"}',
'Denmark', 'Environment'),

('PUB-RA-MICROFLORA-DK', 'Publications', 'research_articles', 'methodology_papers', NULL, NULL, 'Website/Publication', 'national', 'Microflora Danica',
'https://vbn.aau.dk/en/publications/microflora-danica-the-microbiome-of-denmark-2', 'Publication describing the Microflora Danica project, aiming to map the Danish microbiome.',
'microbiome, Denmark, publication, research, environment, human', '2024-01-01', 'N/A',
'{"title": "Microflora Danica - The Microbiome of Denmark", "institution": "Aalborg University", "geographic_coverage": "Denmark", "license": "Journal Copyright", "version": "N/A"}',
'Denmark', 'Environment'), -- Primary Domain: Environment

('SYS-SURV-MIDAS-DK', 'Systems', 'surveillance_network', 'environmental_monitoring', 'wastewater_surveillance', NULL, 'Project Website', 'local/national', 'MIDAS Denmark / Repares',
'https://repares.vscht.cz/project', 'Microbiology dashboard for wastewater surveillance in Denmark (part of Repares project).',
'wastewater, surveillance, environment, Denmark, microbiology, AMR', '2024-01-01', 'N/A',
'{"title": "MIDAS Denmark / Repares Wastewater Surveillance", "institution": "Various (REPARES)", "geographic_coverage": "Denmark", "license": "N/A", "version": "Ongoing"}',
'Denmark', 'Environment'),

-- Denmark - Predictors
('ENT-GOV-STATDK-DK', 'Entities', 'funding_bodies', 'government_agencies', NULL, NULL, 'Website', 'national', 'Danmarks Statistik',
'https://www.dst.dk/en/', 'Statistics Denmark, providing national statistics relevant to societal factors.',
'statistics, demographics, societal factors, Denmark, government', '2024-01-01', 'dst@dst.dk',
'{"title": "Danmarks Statistik (Statistics Denmark)", "institution": "Danmarks Statistik", "geographic_coverage": "Denmark", "license": "Public Data", "version": "N/A"}',
'Denmark', 'Human'), -- Domain: Human (societal factors)

('ENT-GOV-HEALTHMIN-DK', 'Entities', 'funding_bodies', 'government_agencies', NULL, NULL, 'Website', 'national', 'Danish Ministry of Health',
'https://sum.dk/English', 'The Danish Ministry of Health (Sundhedsministeriet). Sets national health policy.',
'government, policy, health, Denmark, ministry', '2024-01-01', 'sum@sum.dk',
'{"title": "Danish Ministry of Health", "institution": "Sundhedsministeriet", "geographic_coverage": "Denmark", "license": "Government Publication", "version": "N/A"}',
'Denmark', 'Human'),

-- Denmark - Research Centers
('ENT-RESC-DAMRA-DK', 'Entities', 'research_consortia', 'public_health_networks', NULL, NULL, 'Website', 'national', 'Danish AMR Alliance',
'https://novonordiskfonden.dk/en/news/new-danish-alliance-will-combat-a-global-health-crisis/', 'New alliance funded by Novo Nordisk Foundation to combat AMR in Denmark.',
'research, AMR, alliance, consortium, Denmark, funding', '2024-01-01', 'N/A',
'{"title": "Danish AMR Alliance (DAMRA)", "institution": "Novo Nordisk Foundation", "geographic_coverage": "Denmark", "license": "N/A", "version": "New"}',
'Denmark', 'Human'),

('ENT-RESC-ICARS-DK', 'Entities', 'research_consortia', 'international_initiatives', NULL, NULL, 'Website', 'international', 'ICARS',
'https://icars-global.org/', 'International Centre for Antimicrobial Resistance Solutions, hosted by Denmark.',
'research, AMR, international, solutions, consortium, Denmark', '2024-01-01', 'info@icars-global.org',
'{"title": "ICARS - International Centre for Antimicrobial Resistance Solutions", "institution": "ICARS", "geographic_coverage": "International", "license": "N/A", "version": "N/A"}',
'Denmark', 'Human'),

-- Norway - Human Health
('ENT-PHA-FHI-NO', 'Entities', 'public_health_agencies', 'national_health_institutes', NULL, NULL, 'Website', 'national', 'FHI (AMR Section)',
'https://www.fhi.no/en/in/antimicrobial/', 'Norwegian Institute of Public Health (Folkehelseinstituttet) - Antimicrobial Resistance Section.',
'public health, AMR, Norway, institute, surveillance', '2024-01-01', 'N/A',
'{"title": "FHI - Norwegian Institute of Public Health (AMR)", "institution": "FHI", "geographic_coverage": "Norway", "license": "Government Publication", "version": "N/A"}',
'Norway', 'Human'),

('SYS-SURV-NORM-NO', 'Systems', 'surveillance_network', 'pathogen_tracking_systems', 'clinical_isolate_registry', NULL, 'Website/Database', 'national', 'NORM',
'https://www.unn.no/fag-og-forskning/norm-norsk-overvakingssystem-for-antibiotikaresistens-hos-mikrober', 'Norwegian monitoring system for antimicrobial resistance in microbes.',
'surveillance, AMR, human, Norway, monitoring, resistance, microbes', '2024-01-01', 'N/A',
'{"title": "NORM - Norwegian Surveillance System for Antimicrobial Resistance", "institution": "UNN", "geographic_coverage": "Norway", "license": "Public Data", "version": "Annual Reports"}',
'Norway', 'Human'),

('SYS-SURV-KRES-NO', 'Systems', 'surveillance_network', 'pathogen_tracking_systems', 'clinical_isolate_registry', NULL, 'Website/Database', 'national', 'K-Res',
'https://www.unn.no/fag-og-forskning/k-res', 'National advisory unit for detection of antimicrobial resistance mechanisms (Kompetansesenter for påvisning av resistensmekanismer).',
'surveillance, AMR, human, Norway, detection, mechanisms, laboratory', '2024-01-01', 'N/A',
'{"title": "K-Res - National Advisory Unit for Detection of AMR Mechanisms", "institution": "UNN", "geographic_coverage": "Norway", "license": "N/A", "version": "N/A"}',
'Norway', 'Human'),

('ENT-RESC-HUNT-NO', 'Entities', 'research_consortia', 'academic_partnerships', NULL, NULL, 'Website', 'regional', 'HUNT Study',
'https://www.ntnu.no/hunt', 'The Trøndelag Health Study (HUNT), a large population health study in Norway.',
'research, cohort, population health, Norway, human, epidemiology', '2024-01-01', 'hunt@medisin.ntnu.no',
'{"title": "HUNT Study - Trøndelag Health Study", "institution": "NTNU", "geographic_coverage": "Norway (Trøndelag)", "license": "Restricted Access", "version": "Ongoing"}',
'Norway', 'Human'),

('ENT-RESC-TROMSO-NO', 'Entities', 'research_consortia', 'academic_partnerships', NULL, NULL, 'Website', 'regional', 'Tromsø Study',
'https://uit.no/research/tromsostudy', 'Population-based health study conducted in the municipality of Tromsø, Norway.',
'research, cohort, population health, Norway, human, epidemiology', '2024-01-01', 'tromsous@uit.no',
'{"title": "The Tromsø Study", "institution": "UiT", "geographic_coverage": "Norway (Tromsø)", "license": "Restricted Access", "version": "Ongoing"}',
'Norway', 'Human'),

('ENT-LAB-MRSA-NO', 'Entities', 'public_health_agencies', 'national_health_institutes', NULL, NULL, 'Website', 'national', 'MRSA Reference Laboratory',
'https://www.stolav.no/fag-og-forskning/lab/nasjonalt-referanselaboratorium-mrsa', 'National Reference Laboratory for MRSA at St. Olavs Hospital.',
'laboratory, MRSA, reference, Norway, human, diagnostics', '2024-01-01', 'N/A',
'{"title": "National Reference Laboratory for MRSA (Norway)", "institution": "St. Olavs Hospital", "geographic_coverage": "Norway", "license": "N/A", "version": "N/A"}',
'Norway', 'Human'),

('SYS-SURV-NOIS-NO', 'Systems', 'surveillance_network', 'pathogen_tracking_systems', 'healthcare_associated_infections', NULL, 'Website/Database', 'national', 'NOIS',
'https://helsedata.no/en/forvaltere/norwegian-institute-of-public-health/norwegian-surveillance-system-for-antibiotic-use-and-healthcare-associated-infections-nois/', 'Norwegian Surveillance System for Antibiotic Use and Healthcare-Associated Infections.',
'surveillance, antibiotic use, HAI, Norway, human, consumption, infections', '2024-01-01', 'N/A',
'{"title": "NOIS - Norwegian Surveillance System for Antibiotic Use and HAI", "institution": "FHI", "geographic_coverage": "Norway", "license": "Public/Restricted Data", "version": "Ongoing"}',
'Norway', 'Human'),

-- Norway - Animal Health / Food
('SYS-SURV-NORMVET-NO', 'Systems', 'surveillance_network', 'zoonotic_monitoring', 'livestock_health_monitoring', NULL, 'Website/Reports', 'national', 'NORM-VET',
'https://www.vetinst.no/overvaking/antibiotikaresistens-norm-vet', 'Norwegian monitoring programme for antimicrobial resistance in veterinary medicine and food production animals.',
'surveillance, AMR, animal, food, Norway, veterinary, resistance', '2024-01-01', 'post@vetinst.no',
'{"title": "NORM-VET - Norwegian Veterinary Antimicrobial Resistance Monitoring", "institution": "Veterinærinstituttet", "geographic_coverage": "Norway", "license": "Public Reports", "version": "Annual Reports"}',
'Norway', 'Animal'),

('ENT-RESC-HUNTOH-NO', 'Entities', 'research_consortia', 'academic_partnerships', NULL, NULL, 'Website', 'regional', 'HUNT One Health',
'https://www.nmbu.no/en/research/projects/hunt-one-health', 'One Health initiative linked to the HUNT study, focusing on interactions between human, animal, and environmental health.',
'research, one health, cohort, Norway, human, animal, environment', '2024-01-01', 'N/A',
'{"title": "HUNT One Health", "institution": "NMBU/NTNU", "geographic_coverage": "Norway (Trøndelag)", "license": "N/A", "version": "Ongoing"}',
'Norway', 'Animal'), -- Primary Domain: Animal (as it extends HUNT)

('ENT-GOV-NFSA-NO', 'Entities', 'funding_bodies', 'government_agencies', NULL, NULL, 'Website', 'national', 'Norwegian Food Safety Authority',
'https://www.mattilsynet.no/language/english/', 'Norwegian Food Safety Authority (Mattilsynet). Oversees food safety and animal health.',
'food safety, animal health, government, Norway, regulation', '2024-01-01', 'postmottak@mattilsynet.no',
'{"title": "Norwegian Food Safety Authority (Mattilsynet)", "institution": "Mattilsynet", "geographic_coverage": "Norway", "license": "Government Publication", "version": "N/A"}',
'Norway', 'Animal'),

-- Norway - Environment
('ENT-GOV-NEA-NO', 'Entities', 'funding_bodies', 'government_agencies', NULL, NULL, 'Website', 'national', 'Norwegian Environment Agency',
'https://www.miljodirektoratet.no/english/', 'Norwegian Environment Agency (Miljødirektoratet). Manages environmental monitoring and regulations.',
'environment, agency, government, Norway, monitoring, regulation', '2024-01-01', 'post@miljodir.no',
'{"title": "Norwegian Environment Agency", "institution": "Miljødirektoratet", "geographic_coverage": "Norway", "license": "Government Publication", "version": "N/A"}',
'Norway', 'Environment'),

('ENT-GOV-VKM-NO', 'Entities', 'funding_bodies', 'government_agencies', NULL, NULL, 'Website', 'national', 'Norwegian Scientific Committee for Food and Environment',
'https://vkm.no/english.html', 'Provides independent scientific risk assessments related to food safety, animal health, plant health and the environment.',
'risk assessment, food, environment, animal, Norway, scientific committee', '2024-01-01', 'vkm@vkm.no',
'{"title": "Norwegian Scientific Committee for Food and Environment (VKM)", "institution": "VKM", "geographic_coverage": "Norway", "license": "Public Reports", "version": "N/A"}',
'Norway', 'Environment'), -- Primary Domain: Environment

-- Norway - Predictors
('ENT-GOV-STATNO-NO', 'Entities', 'funding_bodies', 'government_agencies', NULL, NULL, 'Website', 'national', 'Statistics Norway',
'https://www.ssb.no/en/', 'Statistics Norway (Statistisk sentralbyrå), providing national statistics.',
'statistics, demographics, societal factors, Norway, government', '2024-01-01', 'ssb@ssb.no',
'{"title": "Statistics Norway (SSB)", "institution": "SSB", "geographic_coverage": "Norway", "license": "Public Data", "version": "N/A"}',
'Norway', 'Human'), -- Domain: Human (societal factors)

('ENT-GOV-HEALTHMIN-NO', 'Entities', 'funding_bodies', 'government_agencies', NULL, NULL, 'Website', 'national', 'Ministry of Health and Care Services (Norway)',
'https://www.regjeringen.no/en/dep/hod/id421/', 'Norwegian Ministry of Health and Care Services (Helse- og omsorgsdepartementet).',
'government, policy, health, Norway, ministry', '2024-01-01', 'postmottak@hod.dep.no',
'{"title": "Ministry of Health and Care Services (Norway)", "institution": "HOD", "geographic_coverage": "Norway", "license": "Government Publication", "version": "N/A"}',
'Norway', 'Human'),

('SYS-SURV-MSIS-NO', 'Systems', 'surveillance_network', 'pathogen_tracking_systems', 'disease_notification', NULL, 'Website/Database', 'national', 'MSIS',
'https://www.fhi.no/ut/msis/', 'Norwegian Surveillance System for Communicable Diseases (Meldingssystem for smittsomme sykdommer).',
'surveillance, infectious diseases, notification, Norway, human', '2024-01-01', 'msis@fhi.no',
'{"title": "MSIS - Norwegian Surveillance System for Communicable Diseases", "institution": "FHI", "geographic_coverage": "Norway", "license": "Restricted Access", "version": "Ongoing"}',
'Norway', 'Human'),

-- Norway - Research Centers
('ENT-RESC-CANS-NO', 'Entities', 'research_consortia', 'academic_partnerships', NULL, NULL, 'Website', 'national', 'CANS',
'https://uit.no/research/cans', 'Centre for new antibacterial strategies at UiT The Arctic University of Norway.',
'research, AMR, antibiotics, strategies, Norway, centre', '2024-01-01', 'N/A',
'{"title": "CANS - Centre for new antibacterial strategies", "institution": "UiT", "geographic_coverage": "Norway", "license": "N/A", "version": "N/A"}',
'Norway', 'Human'),

('ENT-RESC-CAMRIA-NO', 'Entities', 'research_consortia', 'academic_partnerships', NULL, NULL, 'Website', 'national', 'CAMRIA',
'https://camria.w.uib.no/', 'Combatting Anti-Microbial Resistance with Interdisciplinary Approaches at the University of Bergen.',
'research, AMR, interdisciplinary, Norway, centre, one health', '2024-01-01', 'N/A',
'{"title": "CAMRIA - Combatting Anti-Microbial Resistance with Interdisciplinary Approaches", "institution": "UiB", "geographic_coverage": "Norway", "license": "N/A", "version": "N/A"}',
'Norway', 'Human'),

-- Sweden - Human Health
('SYS-SURV-SWEDRES-SE', 'Systems', 'surveillance_network', 'pathogen_tracking_systems', 'clinical_isolate_registry', NULL, 'Website/Reports', 'national', 'Swedres-Svarm',
'https://www.sva.se/en/what-we-do/antibiotics/svarm-resistance-monitoring/swedres-svarm-reports/', 'Swedish integrated monitoring of antimicrobial resistance and consumption (Human and Veterinary).',
'surveillance, AMR, human, animal, Sweden, monitoring, consumption, resistance', '2024-01-01', 'N/A',
'{"title": "Swedres-Svarm Report", "institution": "FOHM/SVA", "geographic_coverage": "Sweden", "license": "Public Reports", "version": "Annual Reports"}',
'Sweden', 'Human'), -- Primary Domain: Human

('ENT-PHA-FOHM-SE', 'Entities', 'public_health_agencies', 'national_health_institutes', NULL, NULL, 'Website', 'national', 'Public Health Agency of Sweden (FOHM)',
'https://www.folkhalsomyndigheten.se/the-public-health-agency-of-sweden/', 'Folkhälsomyndigheten, the national public health agency.',
'public health, Sweden, agency, government', '2024-01-01', 'info@folkhalsomyndigheten.se',
'{"title": "Public Health Agency of Sweden (FOHM)", "institution": "FOHM", "geographic_coverage": "Sweden", "license": "Government Publication", "version": "N/A"}',
'Sweden', 'Human'),

-- Sweden - Animal Health / Food (Svarm covered by Swedres-Svarm entry)
('ENT-GOV-SVA-SE', 'Entities', 'funding_bodies', 'government_agencies', NULL, NULL, 'Website', 'national', 'Swedish Veterinary Agency (SVA)',
'https://www.sva.se/en/', 'Statens veterinärmedicinska anstalt, responsible for animal health.',
'animal health, veterinary, Sweden, agency, government', '2024-01-01', 'sva@sva.se',
'{"title": "Swedish Veterinary Agency (SVA)", "institution": "SVA", "geographic_coverage": "Sweden", "license": "Government Publication", "version": "N/A"}',
'Sweden', 'Animal'),

-- Sweden - Environment
('PUB-POL-ENVAMR-SE', 'Publications', 'policy_documents', 'government_reports', NULL, NULL, 'Website/Report', 'national', 'Sweden Environmental AMR Approach',
'https://www.folkhalsomyndigheten.se/the-public-health-agency-of-sweden/communicable-disease-control/antibiotics-and-antimicrobial-resistance/overview-of-swedens-one-health-response-to-antibiotic-resistance-in-the-environment-sector/', 'Overview of Sweden''s approach to antibiotic resistance in the environment sector.',
'environment, AMR, policy, Sweden, government, report', '2024-01-01', 'N/A',
'{"title": "Sweden''s Approach to Antibiotic Resistance in the Environment Sector", "institution": "FOHM/SEPA/MPA", "geographic_coverage": "Sweden", "license": "Government Publication", "version": "N/A"}',
'Sweden', 'Environment'),

('ENT-GOV-SEPA-SE', 'Entities', 'funding_bodies', 'government_agencies', NULL, NULL, 'Website', 'national', 'Swedish Environmental Protection Agency',
'https://www.naturvardsverket.se/en/', 'Naturvårdsverket, the Swedish environmental protection agency.',
'environment, agency, government, Sweden, regulation, monitoring', '2024-01-01', 'registrator@naturvardsverket.se',
'{"title": "Swedish Environmental Protection Agency", "institution": "Naturvårdsverket", "geographic_coverage": "Sweden", "license": "Government Publication", "version": "N/A"}',
'Sweden', 'Environment'),

('ENT-GOV-MPA-SE', 'Entities', 'funding_bodies', 'government_agencies', NULL, NULL, 'Website', 'national', 'Swedish Medical Products Agency',
'https://www.lakemedelsverket.se/en', 'Läkemedelsverket, responsible for regulation and surveillance of medical products.',
'medical products, regulation, Sweden, agency, government', '2024-01-01', 'registrator@lakemedelsverket.se',
'{"title": "Swedish Medical Products Agency", "institution": "Läkemedelsverket", "geographic_coverage": "Sweden", "license": "Government Publication", "version": "N/A"}',
'Sweden', 'Human'), -- Domain: Human (related to health products)

-- Sweden - Predictors
('ENT-GOV-STATSE-SE', 'Entities', 'funding_bodies', 'government_agencies', NULL, NULL, 'Website', 'national', 'Statistics Sweden',
'https://www.scb.se/en/', 'Statistics Sweden (Statistiska centralbyrån), providing national statistics.',
'statistics, demographics, societal factors, Sweden, government', '2024-01-01', 'scb@scb.se',
'{"title": "Statistics Sweden (SCB)", "institution": "SCB", "geographic_coverage": "Sweden", "license": "Public Data", "version": "N/A"}',
'Sweden', 'Human'), -- Domain: Human (societal factors)

('ENT-GOV-HEALTHMIN-SE', 'Entities', 'funding_bodies', 'government_agencies', NULL, NULL, 'Website', 'national', 'Ministry of Health and Social Affairs (Sweden)',
'https://www.government.se/government-of-sweden/ministry-of-health-and-social-affairs/', 'Swedish Ministry of Health and Social Affairs (Socialdepartementet).',
'government, policy, health, social affairs, Sweden, ministry', '2024-01-01', 'N/A',
'{"title": "Ministry of Health and Social Affairs (Sweden)", "institution": "Socialdepartementet", "geographic_coverage": "Sweden", "license": "Government Publication", "version": "N/A"}',
'Sweden', 'Human'),

-- Sweden - Research Centers
('ENT-RESC-UAC-SE', 'Entities', 'research_consortia', 'academic_partnerships', NULL, NULL, 'Website', 'national', 'Uppsala Antibiotic Center',
'https://www.uu.se/en/centre/uppsala-antibiotic-center', 'Interdisciplinary research center focusing on antibiotic resistance at Uppsala University.',
'research, AMR, antibiotics, Sweden, centre, Uppsala', '2024-01-01', 'uac@uu.se',
'{"title": "Uppsala Antibiotic Center (UAC)", "institution": "Uppsala University", "geographic_coverage": "Sweden", "license": "N/A", "version": "N/A"}',
'Sweden', 'Human'),

('ENT-RESC-UCMR-SE', 'Entities', 'research_consortia', 'academic_partnerships', NULL, NULL, 'Website', 'national', 'Umeå Centre for Microbial Research (UCMR)',
'https://www.umu.se/en/research/centres-and-networks/umea-centre-for-microbial-research/', 'Research center focusing on microbial research, including infection biology, at Umeå University.',
'research, microbial, infection, Sweden, centre, Umeå', '2024-01-01', 'info.ucmr@umu.se',
'{"title": "Umeå Centre for Microbial Research (UCMR)", "institution": "Umeå University", "geographic_coverage": "Sweden", "license": "N/A", "version": "N/A"}',
'Sweden', 'Human'),

('ENT-RESC-CARE-SE', 'Entities', 'research_consortia', 'academic_partnerships', NULL, NULL, 'Website', 'national', 'Centre for Antibiotic Resistance Research (Gothenburg)',
'https://www.gu.se/en/care', 'Interdisciplinary research center focusing on antibiotic resistance at University of Gothenburg.',
'research, AMR, antibiotics, Sweden, centre, Gothenburg', '2024-01-01', 'care@gu.se',
'{"title": "Centre for Antibiotic Resistance Research (CARE)", "institution": "University of Gothenburg", "geographic_coverage": "Sweden", "license": "N/A", "version": "N/A"}',
'Sweden', 'Human'),

-- Finland - Human Health
('SYS-SURV-FIRE-FI', 'Systems', 'surveillance_network', 'pathogen_tracking_systems', 'clinical_isolate_registry', NULL, 'Website/Reports', 'national', 'FIRe/FinRes',
'https://thl.fi/en/main-page', 'Finnish national surveillance system for antimicrobial resistance (part of THL activities). Link points to THL main page, specific FIRe link might be internal or report-based.',
'surveillance, AMR, human, Finland, monitoring, resistance', '2024-01-01', 'kirjaamo@thl.fi',
'{"title": "FIRe/FinRes - Finnish Antimicrobial Resistance Surveillance", "institution": "THL", "geographic_coverage": "Finland", "license": "Public Reports", "version": "Annual Reports"}',
'Finland', 'Human'),

('ENT-PHA-THL-FI', 'Entities', 'public_health_agencies', 'national_health_institutes', NULL, NULL, 'Website', 'national', 'Finnish Institute for Health and Welfare (THL)',
'https://thl.fi/en/main-page', 'Terveyden ja hyvinvoinnin laitos, the national public health agency.',
'public health, Finland, agency, government, welfare', '2024-01-01', 'kirjaamo@thl.fi',
'{"title": "Finnish Institute for Health and Welfare (THL)", "institution": "THL", "geographic_coverage": "Finland", "license": "Government Publication", "version": "N/A"}',
'Finland', 'Human'),

-- Finland - Animal Health / Food
('SYS-SURV-FINRESVET-FI', 'Systems', 'surveillance_network', 'zoonotic_monitoring', 'livestock_health_monitoring', NULL, 'Website/Reports', 'national', 'FinRes-Vet',
'https://www.ruokavirasto.fi/en/animals/animal-medication/monitoring-of-antibiotic-resistance/finres-vet-reports/', 'Finnish monitoring programme for antimicrobial resistance in veterinary medicine and food production animals.',
'surveillance, AMR, animal, food, Finland, veterinary, resistance', '2024-01-01', 'kirjaamo@ruokavirasto.fi',
'{"title": "FinRes-Vet - Finnish Veterinary Antimicrobial Resistance Monitoring", "institution": "Ruokavirasto", "geographic_coverage": "Finland", "license": "Public Reports", "version": "Annual Reports"}',
'Finland', 'Animal'),

('ENT-GOV-FFA-FI', 'Entities', 'funding_bodies', 'government_agencies', NULL, NULL, 'Website', 'national', 'Finnish Food Authority',
'https://www.ruokavirasto.fi/en/', 'Ruokavirasto, responsible for food safety, animal health and welfare.',
'food safety, animal health, Finland, agency, government', '2024-01-01', 'kirjaamo@ruokavirasto.fi',
'{"title": "Finnish Food Authority (Ruokavirasto)", "institution": "Ruokavirasto", "geographic_coverage": "Finland", "license": "Government Publication", "version": "N/A"}',
'Finland', 'Animal'),

-- Finland - Environment
('SYS-SURV-WASTPAN-FI', 'Systems', 'surveillance_network', 'environmental_monitoring', 'wastewater_surveillance', NULL, 'Project Website', 'national', 'WastPan',
'https://thl.fi/en/research-and-development/research-and-projects/wastewater-based-surveillance-as-pandemic-preparedness-tool-wastpan-', 'Wastewater-based surveillance project for pandemic preparedness at THL.',
'wastewater, surveillance, environment, Finland, pandemic, preparedness', '2024-01-01', 'kirjaamo@thl.fi',
'{"title": "WastPan - Wastewater Surveillance Project", "institution": "THL", "geographic_coverage": "Finland", "license": "N/A", "version": "Ongoing"}',
'Finland', 'Environment'),

-- Finland - Predictors
('ENT-GOV-FINDATA-FI', 'Entities', 'data_repositories', 'clinical_data_repositories', NULL, NULL, 'Website', 'national', 'Findata',
'https://findata.fi/en/', 'Finnish social and health data permit authority, enabling secondary use of data.',
'data access, health data, social data, Finland, permit authority, secondary use', '2024-01-01', 'info@findata.fi',
'{"title": "Findata - Finnish Social and Health Data Permit Authority", "institution": "Findata", "geographic_coverage": "Finland", "license": "Permit Required", "version": "N/A"}',
'Finland', 'Human'), -- Domain: Human (health/social data)

('ENT-GOV-HEALTHMIN-FI', 'Entities', 'funding_bodies', 'government_agencies', NULL, NULL, 'Website', 'national', 'Ministry of Social Affairs and Health (Finland)',
'https://stm.fi/en/frontpage', 'Finnish Ministry of Social Affairs and Health (Sosiaali- ja terveysministeriö).',
'government, policy, health, social affairs, Finland, ministry', '2024-01-01', 'kirjaamo.stm@gov.fi',
'{"title": "Ministry of Social Affairs and Health (Finland)", "institution": "STM", "geographic_coverage": "Finland", "license": "Government Publication", "version": "N/A"}',
'Finland', 'Human'),

-- Finland - Research Centers
('ENT-RESC-COEAMR-FI', 'Entities', 'research_consortia', 'academic_partnerships', NULL, NULL, 'Website', 'national', 'Finnish CoE in AMR Research',
'https://www.aka.fi/en/research-funding/programmes-and-other-funding-schemes/finnish-centres-of-excellence/new-centres-of-excellence/multidisciplinary-centre-of-excellence-in-antimicrobial-resistance-research/', 'Finnish Multidisciplinary Centre of Excellence in Antimicrobial Resistance Research.',
'research, AMR, multidisciplinary, Finland, centre of excellence', '2024-01-01', 'N/A',
'{"title": "Finnish Multidisciplinary Centre of Excellence in AMR Research", "institution": "Academy of Finland", "geographic_coverage": "Finland", "license": "N/A", "version": "N/A"}',
'Finland', 'Human'); 