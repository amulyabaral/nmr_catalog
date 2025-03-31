-- Clear existing data before inserting new data
DELETE FROM data_points;

-- Insert new data matching the refined schema and hierarchy
-- Columns: data_source_id, resource_type, category, subcategory, data_type, level5, year_start, year_end, data_format, data_resolution, repository, repository_url, data_description, keywords, last_updated, contact_information, metadata, country, domain
INSERT INTO data_points VALUES

-- Denmark - Human Health
('SYS-SURV-DANMAP-DK', 'Systems', 'surveillance_network', 'pathogen_tracking_systems', 'clinical_isolate_registry', NULL, 1995, 2023, 'Unknown', 'Unknown', 'www.danmap.org',
'https://www.danmap.org/', 'Danish Integrated Antimicrobial Resistance Monitoring and Research Programme. Monitors antimicrobial consumption and resistance in humans and animals.',
'surveillance, AMR, human, animal, Denmark, monitoring, consumption, resistance', '2024-01-01', 'danmap@ssi.dk',
'{"title": "DANMAP", "institution": "Unknown", "license": "Public Access", "original_url": "https://www.danmap.org/", "related_metadata_categories": [], "related_resource_ids": [], "submitted_description": "Danish Integrated Antimicrobial Resistance Monitoring and Research Programme. Monitors antimicrobial consumption and resistance in humans and animals."}',
'Denmark', 'Human'),

('ENT-RESC-COPSAC-DK', 'Entities', 'research_consortia', 'academic_partnerships', NULL, NULL, 2000, 2024, 'Unknown', 'Unknown', 'copsac.com',
'https://copsac.com/', 'Copenhagen Prospective Studies on Asthma in Childhood. Research includes microbiome and potential links to health outcomes.',
'research, cohort, asthma, microbiome, children, Denmark, human', '2024-01-01', 'info@copsac.com',
'{"title": "COPSAC - Copenhagen Prospective Studies on Asthma in Childhood", "institution": "Unknown", "license": "N/A", "original_url": "https://copsac.com/", "related_metadata_categories": [], "related_resource_ids": [], "submitted_description": "Copenhagen Prospective Studies on Asthma in Childhood. Research includes microbiome and potential links to health outcomes."}',
'Denmark', 'Human'),

-- Denmark - Environment
('ENT-GOV-DEPA-DK', 'Entities', 'funding_bodies', 'government_agencies', NULL, NULL, 1971, 2024, 'Unknown', 'Unknown', 'eng.mst.dk',
'https://eng.mst.dk/', 'The Danish Environmental Protection Agency (Miljøstyrelsen). Involved in environmental regulations and monitoring.',
'environment, agency, government, Denmark, regulation, monitoring', '2024-01-01', 'mst@mst.dk',
'{"title": "Danish Environmental Protection Agency", "institution": "Unknown", "license": "Government Publication", "original_url": "https://eng.mst.dk/", "related_metadata_categories": [], "related_resource_ids": [], "submitted_description": "The Danish Environmental Protection Agency (Miljøstyrelsen). Involved in environmental regulations and monitoring."}',
'Denmark', 'Environment'),

('PUB-RA-MICROFLORA-DK', 'Publications', 'research_articles', 'methodology_papers', NULL, NULL, 2020, 2020, 'Unknown', 'Unknown', 'vbn.aau.dk',
'https://vbn.aau.dk/en/publications/microflora-danica-the-microbiome-of-denmark-2', 'Publication describing the Microflora Danica project, aiming to map the Danish microbiome.',
'microbiome, Denmark, publication, research, environment, human', '2024-01-01', NULL,
'{"title": "Microflora Danica - The Microbiome of Denmark", "institution": "Unknown", "license": "Journal Copyright", "original_url": "https://vbn.aau.dk/en/publications/microflora-danica-the-microbiome-of-denmark-2", "related_metadata_categories": [], "related_resource_ids": [], "submitted_description": "Publication describing the Microflora Danica project, aiming to map the Danish microbiome."}',
'Denmark', 'Environment'),

('SYS-SURV-MIDAS-DK', 'Systems', 'surveillance_network', 'environmental_monitoring', 'wastewater_surveillance', NULL, 2021, 2024, 'Unknown', 'Unknown', 'repares.vscht.cz',
'https://repares.vscht.cz/project', 'Microbiology dashboard for wastewater surveillance in Denmark (part of Repares project).',
'wastewater, surveillance, environment, Denmark, microbiology, AMR', '2024-01-01', NULL,
'{"title": "MIDAS Denmark / Repares Wastewater Surveillance", "institution": "Unknown", "license": "N/A", "original_url": "https://repares.vscht.cz/project", "related_metadata_categories": [], "related_resource_ids": [], "submitted_description": "Microbiology dashboard for wastewater surveillance in Denmark (part of Repares project)."}',
'Denmark', 'Environment'),

-- Denmark - Predictors (Representing entities providing predictor data)
('ENT-GOV-STATDK-DK', 'Entities', 'funding_bodies', 'government_agencies', NULL, NULL, 1850, 2024, 'Unknown', 'Unknown', 'www.dst.dk',
'https://www.dst.dk/en/', 'Statistics Denmark, providing national statistics relevant to societal factors.',
'statistics, demographics, societal factors, Denmark, government', '2024-01-01', 'dst@dst.dk',
'{"title": "Danmarks Statistik (Statistics Denmark)", "institution": "Unknown", "license": "Public Data", "original_url": "https://www.dst.dk/en/", "related_metadata_categories": [], "related_resource_ids": [], "submitted_description": "Statistics Denmark, providing national statistics relevant to societal factors."}',
'Denmark', 'Human'),

('ENT-GOV-HEALTHMIN-DK', 'Entities', 'funding_bodies', 'government_agencies', NULL, NULL, 1987, 2024, 'Unknown', 'Unknown', 'sum.dk',
'https://sum.dk/English', 'The Danish Ministry of Health (Sundhedsministeriet). Sets national health policy.',
'government, policy, health, Denmark, ministry', '2024-01-01', 'sum@sum.dk',
'{"title": "Danish Ministry of Health", "institution": "Unknown", "license": "Government Publication", "original_url": "https://sum.dk/English", "related_metadata_categories": [], "related_resource_ids": [], "submitted_description": "The Danish Ministry of Health (Sundhedsministeriet). Sets national health policy."}',
'Denmark', 'Human'),

-- Denmark - Research Centers
('ENT-RESC-DAMRA-DK', 'Entities', 'research_consortia', 'public_health_networks', NULL, NULL, 2023, 2028, 'Unknown', 'Unknown', 'novonordiskfonden.dk',
'https://novonordiskfonden.dk/en/news/new-danish-alliance-will-combat-a-global-health-crisis/', 'New alliance funded by Novo Nordisk Foundation to combat AMR in Denmark.',
'research, AMR, alliance, consortium, Denmark, funding', '2024-01-01', NULL,
'{"title": "Danish AMR Alliance (DAMRA)", "institution": "Unknown", "license": "N/A", "original_url": "https://novonordiskfonden.dk/en/news/new-danish-alliance-will-combat-a-global-health-crisis/", "related_metadata_categories": [], "related_resource_ids": [], "submitted_description": "New alliance funded by Novo Nordisk Foundation to combat AMR in Denmark."}',
'Denmark', 'Human'),

('ENT-RESC-ICARS-DK', 'Entities', 'research_consortia', 'international_initiatives', NULL, NULL, 2018, 2024, 'Unknown', 'Unknown', 'icars-global.org',
'https://icars-global.org/', 'International Centre for Antimicrobial Resistance Solutions, hosted by Denmark.',
'research, AMR, international, solutions, consortium, Denmark', '2024-01-01', 'info@icars-global.org',
'{"title": "ICARS - International Centre for Antimicrobial Resistance Solutions", "institution": "Unknown", "license": "N/A", "original_url": "https://icars-global.org/", "related_metadata_categories": [], "related_resource_ids": [], "submitted_description": "International Centre for Antimicrobial Resistance Solutions, hosted by Denmark."}',
'Denmark', 'Human'),

-- Norway - Human Health
('ENT-PHA-FHI-NO', 'Entities', 'public_health_agencies', 'national_health_institutes', NULL, NULL, 2002, 2024, 'Unknown', 'Unknown', 'www.fhi.no',
'https://www.fhi.no/en/in/antimicrobial/', 'Norwegian Institute of Public Health (Folkehelseinstituttet) - Antimicrobial Resistance Section.',
'public health, AMR, Norway, institute, surveillance', '2024-01-01', NULL,
'{"title": "FHI - Norwegian Institute of Public Health (AMR)", "institution": "Unknown", "license": "Government Publication", "original_url": "https://www.fhi.no/en/in/antimicrobial/", "related_metadata_categories": [], "related_resource_ids": [], "submitted_description": "Norwegian Institute of Public Health (Folkehelseinstituttet) - Antimicrobial Resistance Section."}',
'Norway', 'Human'),

('SYS-SURV-NORM-NO', 'Systems', 'surveillance_network', 'pathogen_tracking_systems', 'clinical_isolate_registry', NULL, 2000, 2023, 'Unknown', 'Unknown', 'www.unn.no',
'https://www.unn.no/fag-og-forskning/norm-norsk-overvakingssystem-for-antibiotikaresistens-hos-mikrober', 'Norwegian monitoring system for antimicrobial resistance in microbes.',
'surveillance, AMR, human, Norway, monitoring, resistance, microbes', '2024-01-01', NULL,
'{"title": "NORM - Norwegian Surveillance System for Antimicrobial Resistance", "institution": "Unknown", "license": "Public Data", "original_url": "https://www.unn.no/fag-og-forskning/norm-norsk-overvakingssystem-for-antibiotikaresistens-hos-mikrober", "related_metadata_categories": [], "related_resource_ids": [], "submitted_description": "Norwegian monitoring system for antimicrobial resistance in microbes."}',
'Norway', 'Human'),

('SYS-SURV-KRES-NO', 'Systems', 'surveillance_network', 'pathogen_tracking_systems', 'clinical_isolate_registry', NULL, 2005, 2024, 'Unknown', 'Unknown', 'www.unn.no',
'https://www.unn.no/fag-og-forskning/k-res', 'National advisory unit for detection of antimicrobial resistance mechanisms (Kompetansesenter for påvisning av resistensmekanismer).',
'surveillance, AMR, human, Norway, detection, mechanisms, laboratory', '2024-01-01', NULL,
'{"title": "K-Res - National Advisory Unit for Detection of AMR Mechanisms", "institution": "Unknown", "license": "N/A", "original_url": "https://www.unn.no/fag-og-forskning/k-res", "related_metadata_categories": [], "related_resource_ids": [], "submitted_description": "National advisory unit for detection of antimicrobial resistance mechanisms (Kompetansesenter for påvisning av resistensmekanismer)."}',
'Norway', 'Human'),

('ENT-RESC-HUNT-NO', 'Entities', 'research_consortia', 'academic_partnerships', NULL, NULL, 1984, 2024, 'Unknown', 'Unknown', 'www.ntnu.no',
'https://www.ntnu.no/hunt', 'The Trøndelag Health Study (HUNT), a large population health study in Norway.',
'research, cohort, population health, Norway, human, epidemiology', '2024-01-01', 'hunt@medisin.ntnu.no',
'{"title": "HUNT Study - Trøndelag Health Study", "institution": "Unknown", "license": "Restricted Access", "original_url": "https://www.ntnu.no/hunt", "related_metadata_categories": [], "related_resource_ids": [], "submitted_description": "The Trøndelag Health Study (HUNT), a large population health study in Norway."}',
'Norway', 'Human'),

('ENT-RESC-TROMSO-NO', 'Entities', 'research_consortia', 'academic_partnerships', NULL, NULL, 1974, 2024, 'Unknown', 'Unknown', 'uit.no',
'https://uit.no/research/tromsostudy', 'Population-based health study conducted in the municipality of Tromsø, Norway.',
'research, cohort, population health, Norway, human, epidemiology', '2024-01-01', 'tromsous@uit.no',
'{"title": "The Tromsø Study", "institution": "Unknown", "license": "Restricted Access", "original_url": "https://uit.no/research/tromsostudy", "related_metadata_categories": [], "related_resource_ids": [], "submitted_description": "Population-based health study conducted in the municipality of Tromsø, Norway."}',
'Norway', 'Human'),

('ENT-LAB-MRSA-NO', 'Entities', 'public_health_agencies', 'national_health_institutes', NULL, NULL, 2006, 2024, 'Unknown', 'Unknown', 'www.stolav.no',
'https://www.stolav.no/fag-og-forskning/lab/nasjonalt-referanselaboratorium-mrsa', 'National Reference Laboratory for MRSA at St. Olavs Hospital.',
'laboratory, MRSA, reference, Norway, human, diagnostics', '2024-01-01', NULL,
'{"title": "National Reference Laboratory for MRSA (Norway)", "institution": "Unknown", "license": "N/A", "original_url": "https://www.stolav.no/fag-og-forskning/lab/nasjonalt-referanselaboratorium-mrsa", "related_metadata_categories": [], "related_resource_ids": [], "submitted_description": "National Reference Laboratory for MRSA at St. Olavs Hospital."}',
'Norway', 'Human'),

('SYS-SURV-NOIS-NO', 'Systems', 'surveillance_network', 'pathogen_tracking_systems', 'healthcare_associated_infections', NULL, 2005, 2024, 'Unknown', 'Unknown', 'helsedata.no',
'https://helsedata.no/en/forvaltere/norwegian-institute-of-public-health/norwegian-surveillance-system-for-antibiotic-use-and-healthcare-associated-infections-nois/', 'Norwegian Surveillance System for Antibiotic Use and Healthcare-Associated Infections.',
'surveillance, antibiotic use, HAI, Norway, human, consumption, infections', '2024-01-01', NULL,
'{"title": "NOIS - Norwegian Surveillance System for Antibiotic Use and HAI", "institution": "Unknown", "license": "Public/Restricted Data", "original_url": "https://helsedata.no/en/forvaltere/norwegian-institute-of-public-health/norwegian-surveillance-system-for-antibiotic-use-and-healthcare-associated-infections-nois/", "related_metadata_categories": [], "related_resource_ids": [], "submitted_description": "Norwegian Surveillance System for Antibiotic Use and Healthcare-Associated Infections."}',
'Norway', 'Human'),

-- Norway - Animal Health / Food
('SYS-SURV-NORMVET-NO', 'Systems', 'surveillance_network', 'zoonotic_monitoring', 'livestock_health_monitoring', NULL, 2000, 2023, 'Unknown', 'Unknown', 'www.vetinst.no',
'https://www.vetinst.no/overvaking/antibiotikaresistens-norm-vet', 'Norwegian monitoring programme for antimicrobial resistance in veterinary medicine and food production animals.',
'surveillance, AMR, animal, food, Norway, veterinary, resistance', '2024-01-01', 'post@vetinst.no',
'{"title": "NORM-VET - Norwegian Veterinary Antimicrobial Resistance Monitoring", "institution": "Unknown", "license": "Public Reports", "original_url": "https://www.vetinst.no/overvaking/antibiotikaresistens-norm-vet", "related_metadata_categories": [], "related_resource_ids": [], "submitted_description": "Norwegian monitoring programme for antimicrobial resistance in veterinary medicine and food production animals."}',
'Norway', 'Animal'),

('ENT-RESC-HUNTOH-NO', 'Entities', 'research_consortia', 'academic_partnerships', NULL, NULL, 2019, 2024, 'Unknown', 'Unknown', 'www.nmbu.no',
'https://www.nmbu.no/en/research/projects/hunt-one-health', 'One Health initiative linked to the HUNT study, focusing on interactions between human, animal, and environmental health.',
'research, one health, cohort, Norway, human, animal, environment', '2024-01-01', NULL,
'{"title": "HUNT One Health", "institution": "Unknown", "license": "N/A", "original_url": "https://www.nmbu.no/en/research/projects/hunt-one-health", "related_metadata_categories": [], "related_resource_ids": [], "submitted_description": "One Health initiative linked to the HUNT study, focusing on interactions between human, animal, and environmental health."}',
'Norway', 'Animal'), -- Primary Domain: Animal (as it extends HUNT)

('ENT-GOV-NFSA-NO', 'Entities', 'funding_bodies', 'government_agencies', NULL, NULL, 2004, 2024, 'Unknown', 'Unknown', 'www.mattilsynet.no',
'https://www.mattilsynet.no/language/english/', 'Norwegian Food Safety Authority (Mattilsynet). Oversees food safety and animal health.',
'food safety, animal health, government, Norway, regulation', '2024-01-01', 'postmottak@mattilsynet.no',
'{"title": "Norwegian Food Safety Authority (Mattilsynet)", "institution": "Unknown", "license": "Government Publication", "original_url": "https://www.mattilsynet.no/language/english/", "related_metadata_categories": [], "related_resource_ids": [], "submitted_description": "Norwegian Food Safety Authority (Mattilsynet). Oversees food safety and animal health."}',
'Norway', 'Animal'),

-- Norway - Environment
('ENT-GOV-NEA-NO', 'Entities', 'funding_bodies', 'government_agencies', NULL, NULL, 2013, 2024, 'Unknown', 'Unknown', 'www.miljodirektoratet.no',
'https://www.miljodirektoratet.no/english/', 'Norwegian Environment Agency (Miljødirektoratet). Manages environmental monitoring and regulations.',
'environment, agency, government, Norway, monitoring, regulation', '2024-01-01', 'post@miljodir.no',
'{"title": "Norwegian Environment Agency", "institution": "Unknown", "license": "Government Publication", "original_url": "https://www.miljodirektoratet.no/english/", "related_metadata_categories": [], "related_resource_ids": [], "submitted_description": "Norwegian Environment Agency (Miljødirektoratet). Manages environmental monitoring and regulations."}',
'Norway', 'Environment'),

('ENT-GOV-VKM-NO', 'Entities', 'funding_bodies', 'government_agencies', NULL, NULL, 2004, 2024, 'Unknown', 'Unknown', 'vkm.no',
'https://vkm.no/english.html', 'Provides independent scientific risk assessments related to food safety, animal health, plant health and the environment.',
'risk assessment, food, environment, animal, Norway, scientific committee', '2024-01-01', 'vkm@vkm.no',
'{"title": "Norwegian Scientific Committee for Food and Environment (VKM)", "institution": "Unknown", "license": "Public Reports", "original_url": "https://vkm.no/english.html", "related_metadata_categories": [], "related_resource_ids": [], "submitted_description": "Provides independent scientific risk assessments related to food safety, animal health, plant health and the environment."}',
'Norway', 'Environment'), -- Primary Domain: Environment

-- Norway - Predictors
('ENT-GOV-STATNO-NO', 'Entities', 'funding_bodies', 'government_agencies', NULL, NULL, 1876, 2024, 'Unknown', 'Unknown', 'www.ssb.no',
'https://www.ssb.no/en/', 'Statistics Norway (Statistisk sentralbyrå), providing national statistics.',
'statistics, demographics, societal factors, Norway, government', '2024-01-01', 'ssb@ssb.no',
'{"title": "Statistics Norway (SSB)", "institution": "Unknown", "license": "Public Data", "original_url": "https://www.ssb.no/en/", "related_metadata_categories": [], "related_resource_ids": [], "submitted_description": "Statistics Norway (Statistisk sentralbyrå), providing national statistics."}',
'Norway', 'Human'), -- Domain: Human (societal factors)

('ENT-GOV-HEALTHMIN-NO', 'Entities', 'funding_bodies', 'government_agencies', NULL, NULL, 1913, 2024, 'Unknown', 'Unknown', 'www.regjeringen.no',
'https://www.regjeringen.no/en/dep/hod/id421/', 'Norwegian Ministry of Health and Care Services (Helse- og omsorgsdepartementet).',
'government, policy, health, Norway, ministry', '2024-01-01', 'postmottak@hod.dep.no',
'{"title": "Ministry of Health and Care Services (Norway)", "institution": "Unknown", "license": "Government Publication", "original_url": "https://www.regjeringen.no/en/dep/hod/id421/", "related_metadata_categories": [], "related_resource_ids": [], "submitted_description": "Norwegian Ministry of Health and Care Services (Helse- og omsorgsdepartementet)."}',
'Norway', 'Human'),

('SYS-SURV-MSIS-NO', 'Systems', 'surveillance_network', 'pathogen_tracking_systems', 'disease_notification', NULL, 1975, 2024, 'Unknown', 'Unknown', 'www.fhi.no',
'https://www.fhi.no/ut/msis/', 'Norwegian Surveillance System for Communicable Diseases (Meldingssystem for smittsomme sykdommer).',
'surveillance, infectious diseases, notification, Norway, human', '2024-01-01', 'msis@fhi.no',
'{"title": "MSIS - Norwegian Surveillance System for Communicable Diseases", "institution": "Unknown", "license": "Restricted Access", "original_url": "https://www.fhi.no/ut/msis/", "related_metadata_categories": [], "related_resource_ids": [], "submitted_description": "Norwegian Surveillance System for Communicable Diseases (Meldingssystem for smittsomme sykdommer)."}',
'Norway', 'Human'),

-- Norway - Research Centers
('ENT-RESC-CANS-NO', 'Entities', 'research_consortia', 'academic_partnerships', NULL, NULL, 2016, 2024, 'Unknown', 'Unknown', 'uit.no',
'https://uit.no/research/cans', 'Centre for new antibacterial strategies at UiT The Arctic University of Norway.',
'research, AMR, antibiotics, strategies, Norway, centre', '2024-01-01', NULL,
'{"title": "CANS - Centre for new antibacterial strategies", "institution": "Unknown", "license": "N/A", "original_url": "https://uit.no/research/cans", "related_metadata_categories": [], "related_resource_ids": [], "submitted_description": "Centre for new antibacterial strategies at UiT The Arctic University of Norway."}',
'Norway', 'Human'),

('ENT-RESC-CAMRIA-NO', 'Entities', 'research_consortia', 'academic_partnerships', NULL, NULL, 2018, 2024, 'Unknown', 'Unknown', 'camria.w.uib.no',
'https://camria.w.uib.no/', 'Combatting Anti-Microbial Resistance with Interdisciplinary Approaches at the University of Bergen.',
'research, AMR, interdisciplinary, Norway, centre, one health', '2024-01-01', NULL,
'{"title": "CAMRIA - Combatting Anti-Microbial Resistance with Interdisciplinary Approaches", "institution": "Unknown", "license": "N/A", "original_url": "https://camria.w.uib.no/", "related_metadata_categories": [], "related_resource_ids": [], "submitted_description": "Combatting Anti-Microbial Resistance with Interdisciplinary Approaches at the University of Bergen."}',
'Norway', 'Human'),

-- Sweden - Human Health
('SYS-SURV-SWEDRES-SE', 'Systems', 'surveillance_network', 'pathogen_tracking_systems', 'clinical_isolate_registry', NULL, 2000, 2023, 'Unknown', 'Unknown', 'www.sva.se',
'https://www.sva.se/en/what-we-do/antibiotics/svarm-resistance-monitoring/swedres-svarm-reports/', 'Swedish integrated monitoring of antimicrobial resistance and consumption (Human and Veterinary).',
'surveillance, AMR, human, animal, Sweden, monitoring, consumption, resistance', '2024-01-01', NULL,
'{"title": "Swedres-Svarm Report", "institution": "Unknown", "license": "Public Reports", "original_url": "https://www.sva.se/en/what-we-do/antibiotics/svarm-resistance-monitoring/swedres-svarm-reports/", "related_metadata_categories": [], "related_resource_ids": [], "submitted_description": "Swedish integrated monitoring of antimicrobial resistance and consumption (Human and Veterinary)."}',
'Sweden', 'Human'), -- Primary Domain: Human

('ENT-PHA-FOHM-SE', 'Entities', 'public_health_agencies', 'national_health_institutes', NULL, NULL, 2014, 2024, 'Unknown', 'Unknown', 'www.folkhalsomyndigheten.se',
'https://www.folkhalsomyndigheten.se/the-public-health-agency-of-sweden/', 'Folkhälsomyndigheten, the national public health agency.',
'public health, Sweden, agency, government', '2024-01-01', 'info@folkhalsomyndigheten.se',
'{"title": "Public Health Agency of Sweden (FOHM)", "institution": "Unknown", "license": "Government Publication", "original_url": "https://www.folkhalsomyndigheten.se/the-public-health-agency-of-sweden/", "related_metadata_categories": [], "related_resource_ids": [], "submitted_description": "Folkhälsomyndigheten, the national public health agency."}',
'Sweden', 'Human'),

-- Sweden - Animal Health / Food (Svarm covered by Swedres-Svarm entry)
('ENT-GOV-SVA-SE', 'Entities', 'funding_bodies', 'government_agencies', NULL, NULL, 1911, 2024, 'Unknown', 'Unknown', 'www.sva.se',
'https://www.sva.se/en/', 'Statens veterinärmedicinska anstalt, responsible for animal health.',
'animal health, veterinary, Sweden, agency, government', '2024-01-01', 'sva@sva.se',
'{"title": "Swedish Veterinary Agency (SVA)", "institution": "Unknown", "license": "Government Publication", "original_url": "https://www.sva.se/en/", "related_metadata_categories": [], "related_resource_ids": [], "submitted_description": "Statens veterinärmedicinska anstalt, responsible for animal health."}',
'Sweden', 'Animal'),

-- Sweden - Environment
('PUB-POL-ENVAMR-SE', 'Publications', 'policy_documents', 'government_reports', NULL, NULL, 2021, 2021, 'Unknown', 'Unknown', 'www.folkhalsomyndigheten.se',
'https://www.folkhalsomyndigheten.se/the-public-health-agency-of-sweden/communicable-disease-control/antibiotics-and-antimicrobial-resistance/overview-of-swedens-one-health-response-to-antibiotic-resistance-in-the-environment-sector/', 'Overview of Sweden''s approach to antibiotic resistance in the environment sector.',
'environment, AMR, policy, Sweden, government, report', '2024-01-01', NULL,
'{"title": "Sweden''s Approach to Antibiotic Resistance in the Environment Sector", "institution": "Unknown", "license": "Government Publication", "original_url": "https://www.folkhalsomyndigheten.se/the-public-health-agency-of-sweden/communicable-disease-control/antibiotics-and-antimicrobial-resistance/overview-of-swedens-one-health-response-to-antibiotic-resistance-in-the-environment-sector/", "related_metadata_categories": [], "related_resource_ids": [], "submitted_description": "Overview of Sweden''s approach to antibiotic resistance in the environment sector."}',
'Sweden', 'Environment'),

('ENT-GOV-SEPA-SE', 'Entities', 'funding_bodies', 'government_agencies', NULL, NULL, 1967, 2024, 'Unknown', 'Unknown', 'www.naturvardsverket.se',
'https://www.naturvardsverket.se/en/', 'Naturvårdsverket, the Swedish environmental protection agency.',
'environment, agency, government, Sweden, regulation, monitoring', '2024-01-01', 'registrator@naturvardsverket.se',
'{"title": "Swedish Environmental Protection Agency", "institution": "Unknown", "license": "Government Publication", "original_url": "https://www.naturvardsverket.se/en/", "related_metadata_categories": [], "related_resource_ids": [], "submitted_description": "Naturvårdsverket, the Swedish environmental protection agency."}',
'Sweden', 'Environment'),

('ENT-GOV-MPA-SE', 'Entities', 'funding_bodies', 'government_agencies', NULL, NULL, 1990, 2024, 'Unknown', 'Unknown', 'www.lakemedelsverket.se',
'https://www.lakemedelsverket.se/en', 'Läkemedelsverket, responsible for regulation and surveillance of medical products.',
'medical products, regulation, Sweden, agency, government', '2024-01-01', 'registrator@lakemedelsverket.se',
'{"title": "Swedish Medical Products Agency", "institution": "Unknown", "license": "Government Publication", "original_url": "https://www.lakemedelsverket.se/en", "related_metadata_categories": [], "related_resource_ids": [], "submitted_description": "Läkemedelsverket, responsible for regulation and surveillance of medical products."}',
'Sweden', 'Human'), -- Domain: Human (related to health products)

-- Sweden - Predictors
('ENT-GOV-STATSE-SE', 'Entities', 'funding_bodies', 'government_agencies', NULL, NULL, 1858, 2024, 'Unknown', 'Unknown', 'www.scb.se',
'https://www.scb.se/en/', 'Statistics Sweden (Statistiska centralbyrån), providing national statistics.',
'statistics, demographics, societal factors, Sweden, government', '2024-01-01', 'scb@scb.se',
'{"title": "Statistics Sweden (SCB)", "institution": "Unknown", "license": "Public Data", "original_url": "https://www.scb.se/en/", "related_metadata_categories": [], "related_resource_ids": [], "submitted_description": "Statistics Sweden (Statistiska centralbyrån), providing national statistics."}',
'Sweden', 'Human'), -- Domain: Human (societal factors)

('ENT-GOV-HEALTHMIN-SE', 'Entities', 'funding_bodies', 'government_agencies', NULL, NULL, 1840, 2024, 'Unknown', 'Unknown', 'www.government.se',
'https://www.government.se/government-of-sweden/ministry-of-health-and-social-affairs/', 'Swedish Ministry of Health and Social Affairs (Socialdepartementet).',
'government, policy, health, social affairs, Sweden, ministry', '2024-01-01', NULL,
'{"title": "Ministry of Health and Social Affairs (Sweden)", "institution": "Unknown", "license": "Government Publication", "original_url": "https://www.government.se/government-of-sweden/ministry-of-health-and-social-affairs/", "related_metadata_categories": [], "related_resource_ids": [], "submitted_description": "Swedish Ministry of Health and Social Affairs (Socialdepartementet)."}',
'Sweden', 'Human'),

-- Sweden - Research Centers
('ENT-RESC-UAC-SE', 'Entities', 'research_consortia', 'academic_partnerships', NULL, NULL, 2015, 2024, 'Unknown', 'Unknown', 'www.uu.se',
'https://www.uu.se/en/centre/uppsala-antibiotic-center', 'Interdisciplinary research center focusing on antibiotic resistance at Uppsala University.',
'research, AMR, antibiotics, Sweden, centre, Uppsala', '2024-01-01', 'uac@uu.se',
'{"title": "Uppsala Antibiotic Center (UAC)", "institution": "Unknown", "license": "N/A", "original_url": "https://www.uu.se/en/centre/uppsala-antibiotic-center", "related_metadata_categories": [], "related_resource_ids": [], "submitted_description": "Interdisciplinary research center focusing on antibiotic resistance at Uppsala University."}',
'Sweden', 'Human'),

('ENT-RESC-UCMR-SE', 'Entities', 'research_consortia', 'academic_partnerships', NULL, NULL, 2008, 2024, 'Unknown', 'Unknown', 'www.umu.se',
'https://www.umu.se/en/research/centres-and-networks/umea-centre-for-microbial-research/', 'Research center focusing on microbial research, including infection biology, at Umeå University.',
'research, microbial, infection, Sweden, centre, Umeå', '2024-01-01', 'info.ucmr@umu.se',
'{"title": "Umeå Centre for Microbial Research (UCMR)", "institution": "Unknown", "license": "N/A", "original_url": "https://www.umu.se/en/research/centres-and-networks/umea-centre-for-microbial-research/", "related_metadata_categories": [], "related_resource_ids": [], "submitted_description": "Research center focusing on microbial research, including infection biology, at Umeå University."}',
'Sweden', 'Human'),

('ENT-RESC-CARE-SE', 'Entities', 'research_consortia', 'academic_partnerships', NULL, NULL, 2016, 2024, 'Unknown', 'Unknown', 'www.gu.se',
'https://www.gu.se/en/care', 'Interdisciplinary research center focusing on antibiotic resistance at University of Gothenburg.',
'research, AMR, antibiotics, Sweden, centre, Gothenburg', '2024-01-01', 'care@gu.se',
'{"title": "Centre for Antibiotic Resistance Research (CARE)", "institution": "Unknown", "license": "N/A", "original_url": "https://www.gu.se/en/care", "related_metadata_categories": [], "related_resource_ids": [], "submitted_description": "Interdisciplinary research center focusing on antibiotic resistance at University of Gothenburg."}',
'Sweden', 'Human'),

-- Finland - Human Health
('SYS-SURV-FIRE-FI', 'Systems', 'surveillance_network', 'pathogen_tracking_systems', 'clinical_isolate_registry', NULL, 1998, 2023, 'Unknown', 'Unknown', 'thl.fi',
'https://thl.fi/en/main-page', 'Finnish national surveillance system for antimicrobial resistance (part of THL activities). Link points to THL main page, specific FIRe link might be internal or report-based.',
'surveillance, AMR, human, Finland, monitoring, resistance', '2024-01-01', 'kirjaamo@thl.fi',
'{"title": "FIRe/FinRes - Finnish Antimicrobial Resistance Surveillance", "institution": "Unknown", "license": "Public Reports", "original_url": "https://thl.fi/en/main-page", "related_metadata_categories": [], "related_resource_ids": [], "submitted_description": "Finnish national surveillance system for antimicrobial resistance (part of THL activities). Link points to THL main page, specific FIRe link might be internal or report-based."}',
'Finland', 'Human'),

('ENT-PHA-THL-FI', 'Entities', 'public_health_agencies', 'national_health_institutes', NULL, NULL, 2009, 2024, 'Unknown', 'Unknown', 'thl.fi',
'https://thl.fi/en/main-page', 'Terveyden ja hyvinvoinnin laitos, the national public health agency.',
'public health, Finland, agency, government, welfare', '2024-01-01', 'kirjaamo@thl.fi',
'{"title": "Finnish Institute for Health and Welfare (THL)", "institution": "Unknown", "license": "Government Publication", "original_url": "https://thl.fi/en/main-page", "related_metadata_categories": [], "related_resource_ids": [], "submitted_description": "Terveyden ja hyvinvoinnin laitos, the national public health agency."}',
'Finland', 'Human'),

-- Finland - Animal Health / Food
('SYS-SURV-FINRESVET-FI', 'Systems', 'surveillance_network', 'zoonotic_monitoring', 'livestock_health_monitoring', NULL, 2002, 2023, 'Unknown', 'Unknown', 'www.ruokavirasto.fi',
'https://www.ruokavirasto.fi/en/animals/animal-medication/monitoring-of-antibiotic-resistance/finres-vet-reports/', 'Finnish monitoring programme for antimicrobial resistance in veterinary medicine and food production animals.',
'surveillance, AMR, animal, food, Finland, veterinary, resistance', '2024-01-01', 'kirjaamo@ruokavirasto.fi',
'{"title": "FinRes-Vet - Finnish Veterinary Antimicrobial Resistance Monitoring", "institution": "Unknown", "license": "Public Reports", "original_url": "https://www.ruokavirasto.fi/en/animals/animal-medication/monitoring-of-antibiotic-resistance/finres-vet-reports/", "related_metadata_categories": [], "related_resource_ids": [], "submitted_description": "Finnish monitoring programme for antimicrobial resistance in veterinary medicine and food production animals."}',
'Finland', 'Animal'),

('ENT-GOV-FFA-FI', 'Entities', 'funding_bodies', 'government_agencies', NULL, NULL, 2019, 2024, 'Unknown', 'Unknown', 'www.ruokavirasto.fi',
'https://www.ruokavirasto.fi/en/', 'Ruokavirasto, responsible for food safety, animal health and welfare.',
'food safety, animal health, Finland, agency, government', '2024-01-01', 'kirjaamo@ruokavirasto.fi',
'{"title": "Finnish Food Authority (Ruokavirasto)", "institution": "Unknown", "license": "Government Publication", "original_url": "https://www.ruokavirasto.fi/en/", "related_metadata_categories": [], "related_resource_ids": [], "submitted_description": "Ruokavirasto, responsible for food safety, animal health and welfare."}',
'Finland', 'Animal'),

-- Finland - Environment
('SYS-SURV-WASTPAN-FI', 'Systems', 'surveillance_network', 'environmental_monitoring', 'wastewater_surveillance', NULL, 2022, 2024, 'Unknown', 'Unknown', 'thl.fi',
'https://thl.fi/en/research-and-development/research-and-projects/wastewater-based-surveillance-as-pandemic-preparedness-tool-wastpan-', 'Wastewater-based surveillance project for pandemic preparedness at THL.',
'wastewater, surveillance, environment, Finland, pandemic, preparedness', '2024-01-01', 'kirjaamo@thl.fi',
'{"title": "WastPan - Wastewater Surveillance Project", "institution": "Unknown", "license": "N/A", "original_url": "https://thl.fi/en/research-and-development/research-and-projects/wastewater-based-surveillance-as-pandemic-preparedness-tool-wastpan-", "related_metadata_categories": [], "related_resource_ids": [], "submitted_description": "Wastewater-based surveillance project for pandemic preparedness at THL."}',
'Finland', 'Environment'),

-- Finland - Predictors
('ENT-GOV-FINDATA-FI', 'Entities', 'data_repositories', 'clinical_data_repositories', NULL, NULL, 2020, 2024, 'Unknown', 'Unknown', 'findata.fi',
'https://findata.fi/en/', 'Finnish social and health data permit authority, enabling secondary use of data.',
'data access, health data, social data, Finland, permit authority, secondary use', '2024-01-01', 'info@findata.fi',
'{"title": "Findata - Finnish Social and Health Data Permit Authority", "institution": "Unknown", "license": "Permit Required", "original_url": "https://findata.fi/en/", "related_metadata_categories": [], "related_resource_ids": [], "submitted_description": "Finnish social and health data permit authority, enabling secondary use of data."}',
'Finland', 'Human'), -- Domain: Human (health/social data)

('ENT-GOV-HEALTHMIN-FI', 'Entities', 'funding_bodies', 'government_agencies', NULL, NULL, 1970, 2024, 'Unknown', 'Unknown', 'stm.fi',
'https://stm.fi/en/frontpage', 'Finnish Ministry of Social Affairs and Health (Sosiaali- ja terveysministeriö).',
'government, policy, health, social affairs, Finland, ministry', '2024-01-01', 'kirjaamo.stm@gov.fi',
'{"title": "Ministry of Social Affairs and Health (Finland)", "institution": "Unknown", "license": "Government Publication", "original_url": "https://stm.fi/en/frontpage", "related_metadata_categories": [], "related_resource_ids": [], "submitted_description": "Finnish Ministry of Social Affairs and Health (Sosiaali- ja terveysministeriö)."}',
'Finland', 'Human'),

-- Finland - Research Centers
('ENT-RESC-COEAMR-FI', 'Entities', 'research_consortia', 'academic_partnerships', NULL, NULL, 2022, 2029, 'Unknown', 'Unknown', 'www.aka.fi',
'https://www.aka.fi/en/research-funding/programmes-and-other-funding-schemes/finnish-centres-of-excellence/new-centres-of-excellence/multidisciplinary-centre-of-excellence-in-antimicrobial-resistance-research/', 'Finnish Multidisciplinary Centre of Excellence in Antimicrobial Resistance Research.',
'research, AMR, multidisciplinary, Finland, centre of excellence', '2024-01-01', NULL,
'{"title": "Finnish Multidisciplinary Centre of Excellence in AMR Research", "institution": "Unknown", "license": "N/A", "original_url": "https://www.aka.fi/en/research-funding/programmes-and-other-funding-schemes/finnish-centres-of-excellence/new-centres-of-excellence/multidisciplinary-centre-of-excellence-in-antimicrobial-resistance-research/", "related_metadata_categories": [], "related_resource_ids": [], "submitted_description": "Finnish Multidisciplinary Centre of Excellence in Antimicrobial Resistance Research."}',
'Finland', 'Human'); 