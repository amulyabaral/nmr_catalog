-- Clear existing data before inserting new data
DELETE FROM data_points;

-- Insert new data based on _reusables.yaml hierarchy, including level5
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
-- Data -> omics_data -> genomic -> whole_genome_sequencing -> clinical_isolates
('NIPH-WGS-CLIN-2023', 'Data', 'omics_data', 'genomic', 'whole_genome_sequencing', 'clinical_isolates', 'FASTQ', 'high', 'ENA',
'https://www.ebi.ac.uk/ena/browser/view/PRJEB00001', 'Whole Genome Sequencing data of clinical isolates from Norwegian hospitals in 2023.',
'WGS, clinical isolates, AMR, Norway, genomic', '2023-12-01', 'contact@niph.no',
'{"title": "Norwegian WGS Clinical Isolates 2023", "institution": "NIPH", "geographic_coverage": "Norway", "license": "CC BY 4.0", "version": "1.0"}',
'Norway', 'Human'),

-- Data -> omics_data -> genomic -> metagenomic -> wastewater_metagenomes
('KI-MWGS-WW-2022', 'Data', 'omics_data', 'genomic', 'metagenomic', 'wastewater_metagenomes', 'FASTQ.gz', 'high', 'MG-RAST',
'https://www.mg-rast.org/mgmain.html?mgpage=project&project=mgp98765', 'Metagenomic analysis of wastewater samples from Stockholm for AMR gene surveillance.',
'metagenomics, wastewater, AMR, Sweden, environmental', '2022-11-15', 'contact@ki.se',
'{"title": "Stockholm Wastewater Metagenome Study 2022", "institution": "KI", "geographic_coverage": "Sweden", "license": "CC BY-NC 4.0", "version": "1.1"}',
'Sweden', 'Environment'),

-- Data -> omics_data -> transcriptomic -> rna_seq -> bulk_rna_seq
('UH-TRNS-BULK-2023', 'Data', 'omics_data', 'transcriptomic', 'rna_seq', 'bulk_rna_seq', 'BAM', 'high', 'GEO',
'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE00001', 'Bulk RNA-Seq data from Finnish patient samples responding to antibiotic treatment.',
'transcriptomics, RNA-Seq, bulk, Finland, host response', '2023-09-30', 'contact@helsinki.fi',
'{"title": "Finnish Bulk RNA-Seq Host Response", "institution": "UH", "geographic_coverage": "Finland", "license": "CC BY 4.0", "version": "1.0"}',
'Finland', 'Human'),

-- Data -> omics_data -> proteomic -> mass_spectrometry (Level 4 is leaf here)
('DTU-PROT-MS-2023', 'Data', 'omics_data', 'proteomic', 'mass_spectrometry', NULL, 'mzML', 'high', 'PRIDE',
'https://www.ebi.ac.uk/pride/archive/projects/PXD00001', 'Mass spectrometry-based proteomic analysis of resistant bacterial strains from Danish farms.',
'proteomics, mass spectrometry, AMR, Denmark, animal', '2023-10-25', 'contact@dtu.dk',
'{"title": "Danish Farm Animal Proteomics (MS)", "institution": "DTU", "geographic_coverage": "Denmark", "license": "CC BY 4.0", "version": "1.0"}',
'Denmark', 'Animal'),

-- Data -> population_data -> disease_incidence -> vector-borne (Level 4 is leaf here)
('FHI-POP-DIS-VB-2022', 'Data', 'population_data', 'disease_incidence', 'vector-borne', NULL, 'CSV', 'national', 'FHI Portal',
'https://www.fhi.no/data/vector-borne-2022', 'National surveillance data on vector-borne diseases potentially linked to AMR spread in Norway, 2022.',
'population data, disease incidence, vector-borne, Norway, surveillance', '2022-12-31', 'contact@fhi.no',
'{"title": "Norway Vector-Borne Disease Incidence 2022", "institution": "FHI", "geographic_coverage": "Norway", "license": "Restricted", "version": "2022"}',
'Norway', 'Human'),

-- Data -> population_data -> demographic_data -> socioeconomic_factors (Level 4 is leaf here)
('FOHM-POP-DEM-SE-2021', 'Data', 'population_data', 'demographic_data', 'socioeconomic_factors', NULL, 'XLSX', 'regional', 'FOHM Repository',
'https://www.folkhalsomyndigheten.se/data/socioeconomic-2021', 'Analysis of socioeconomic factors and AMR prevalence in different Swedish regions.',
'population data, demographics, socioeconomic, Sweden, AMR', '2021-12-31', 'contact@fohm.se',
'{"title": "Swedish Socioeconomic Factors & AMR 2021", "institution": "FOHM", "geographic_coverage": "Sweden", "license": "CC BY 4.0", "version": "2021"}',
'Sweden', 'Human'),

-- Data -> environmental_data -> air_quality -> bioaerosols (Level 4 is leaf here)
('THL-ENV-AIR-BIO-2023', 'Data', 'environmental_data', 'air_quality', 'bioaerosols', NULL, 'CSV', 'local', 'THL AirData',
'https://www.thl.fi/data/air-bioaerosols-helsinki', 'Monitoring data for bioaerosols containing potential AMR determinants in Helsinki urban air.',
'environmental data, air quality, bioaerosols, Finland, AMR', '2023-08-10', 'contact@thl.fi',
'{"title": "Helsinki Bioaerosol Monitoring 2023", "institution": "THL", "geographic_coverage": "Finland", "license": "CC BY-NC 4.0", "version": "1.0"}',
'Finland', 'Environment'),

-- Data -> environmental_data -> climatological -> temperature_records and anomalies (Level 4 is leaf here)
('NMBU-ENV-CLI-TEMP-2020', 'Data', 'environmental_data', 'climatological', 'temperature_records and anomalies', NULL, 'NetCDF', 'regional', 'NMBU Climate Hub',
'https://www.nmbu.no/data/climate-temp-2020', 'Regional temperature records and anomaly analysis for Southern Norway, 2020.',
'environmental data, climatological, temperature, Norway, climate', '2020-12-31', 'contact@nmbu.no',
'{"title": "Southern Norway Temperature Records 2020", "institution": "NMBU", "geographic_coverage": "Norway", "license": "CC BY 4.0", "version": "2020"}',
'Norway', 'Environment'),

-- Data -> environmental_data -> wastewater_infrastructure -> treatment_plant_locations (Level 4 is leaf here)
('DTU-ENV-WW-LOC-2023', 'Data', 'environmental_data', 'wastewater_infrastructure', 'treatment_plant_locations', NULL, 'GeoJSON', 'national', 'DTU InfraMap',
'https://www.dtu.dk/data/wwtp-locations-dk', 'Geospatial data for wastewater treatment plant locations across Denmark.',
'environmental data, wastewater, infrastructure, locations, Denmark', '2023-01-15', 'contact@dtu.dk',
'{"title": "Denmark WWTP Locations", "institution": "DTU", "geographic_coverage": "Denmark", "license": "Open Data Commons ODbL", "version": "2023.1"}',
'Denmark', 'Environment'),

-- Data -> environmental_data -> water_quality -> drinking_water (Level 4 is leaf here)
('SLU-ENV-WQ-DW-2022', 'Data', 'environmental_data', 'water_quality', 'drinking_water', NULL, 'CSV', 'municipal', 'SLU WaterBase',
'https://www.slu.se/data/drinking-water-quality-2022', 'Drinking water quality monitoring data from selected Swedish municipalities, 2022.',
'environmental data, water quality, drinking water, Sweden, monitoring', '2022-12-31', 'contact@slu.se',
'{"title": "Swedish Drinking Water Quality 2022", "institution": "SLU", "geographic_coverage": "Sweden", "license": "CC BY 4.0", "version": "2022"}',
'Sweden', 'Environment'),

-- Systems -> surveillance_network -> pathogen_tracking_systems -> wastewater_surveillance (Level 4 is leaf here)
('SSI-SYS-SURV-WW-2024', 'Systems', 'surveillance_network', 'pathogen_tracking_systems', 'wastewater_surveillance', NULL, 'Web Platform', 'national', 'SSI Surveillance Portal',
'https://www.ssi.dk/surveillance/wastewater', 'National Danish system for wastewater-based surveillance of pathogens and AMR markers.',
'systems, surveillance, wastewater, Denmark, pathogen tracking', '2024-01-01', 'contact@ssi.dk',
'{"title": "Danish Wastewater Surveillance System", "institution": "SSI", "geographic_coverage": "Denmark", "license": "Proprietary", "version": "3.0"}',
'Denmark', 'Environment'),

-- Systems -> surveillance_network -> zoonotic_monitoring -> wildlife_disease_surveillance (Level 4 is leaf here)
('SVA-SYS-ZOO-WILD-2023', 'Systems', 'surveillance_network', 'zoonotic_monitoring', 'wildlife_disease_surveillance', NULL, 'Database API', 'national', 'SVA Wildlife Health',
'https://www.sva.se/api/wildlife-surveillance', 'Swedish national database and reporting system for wildlife disease surveillance.',
'systems, zoonotic, wildlife, Sweden, surveillance', '2023-11-01', 'contact@sva.se',
'{"title": "Swedish Wildlife Disease Surveillance System", "institution": "SVA", "geographic_coverage": "Sweden", "license": "Restricted Access", "version": "2.5"}',
'Sweden', 'Animal'),

-- Systems -> surveillance_network -> environmental_monitoring -> air_quality_networks (Level 4 is leaf here)
('NILU-SYS-ENV-AIR-2023', 'Systems', 'surveillance_network', 'environmental_monitoring', 'air_quality_networks', NULL, 'Web Dashboard', 'national', 'Luftkvalitet.info',
'https://www.luftkvalitet.info', 'Norwegian national network and platform for monitoring air quality.',
'systems, environmental, air quality, Norway, monitoring network', '2023-12-15', 'contact@nilu.no',
'{"title": "Norwegian Air Quality Monitoring Network", "institution": "NILU", "geographic_coverage": "Norway", "license": "Public Domain", "version": "N/A"}',
'Norway', 'Environment'),

-- Systems -> annotation_platforms -> geospatial_mapping -> OpenStreetMap_integration (Level 4 is leaf here)
('UTU-SYS-ANN-GEO-OSM-2023', 'Systems', 'annotation_platforms', 'geospatial_mapping', 'OpenStreetMap_integration', NULL, 'Web Service', 'regional', 'UTU GeoAnnotate',
'https://geo.utu.fi/osm-integration', 'Platform integrating OpenStreetMap data for geospatial annotation of AMR samples in Finland.',
'systems, annotation, geospatial, OpenStreetMap, Finland', '2023-07-01', 'contact@utu.fi',
'{"title": "UTU Geospatial Annotation Platform (OSM)", "institution": "UTU", "geographic_coverage": "Finland", "license": "MIT", "version": "1.2"}',
'Finland', 'Human'),

-- Systems -> annotation_platforms -> sequence_annotation -> variant_calling (Level 4 is leaf here)
('NMBU-SYS-ANN-SEQ-VAR-2024', 'Systems', 'annotation_platforms', 'sequence_annotation', 'variant_calling', NULL, 'Galaxy Workflow', 'workflow', 'NMBU Galaxy',
'https://galaxy.nmbu.no/workflows/variant-calling-amr', 'Automated variant calling workflow for AMR gene identification deployed on NMBU Galaxy.',
'systems, annotation, sequence, variant calling, Norway, workflow', '2024-02-01', 'contact@nmbu.no',
'{"title": "NMBU AMR Variant Calling Workflow", "institution": "NMBU", "geographic_coverage": "Norway", "license": "Apache 2.0", "version": "2.0"}',
'Norway', 'Human'),

-- Systems -> annotation_platforms -> data_visualization -> dashboard_systems (Level 4 is leaf here)
('KI-SYS-ANN-VIS-DASH-2023', 'Systems', 'annotation_platforms', 'data_visualization', 'dashboard_systems', NULL, 'Web Application', 'national', 'AMR Dashboard Sweden',
'https://amr-dashboard.ki.se', 'Interactive dashboard system for visualizing AMR trends in Sweden.',
'systems, visualization, dashboard, Sweden, AMR trends', '2023-10-01', 'contact@ki.se',
'{"title": "Swedish AMR Data Dashboard", "institution": "KI", "geographic_coverage": "Sweden", "license": "Proprietary", "version": "1.5"}',
'Sweden', 'Human'),

-- Publications -> research_articles -> epidemiological_studies (Level 3 is leaf here)
('PUB-RA-EPI-NOR-2022', 'Publications', 'research_articles', 'epidemiological_studies', NULL, NULL, 'Journal Article', 'N/A', 'The Lancet ID',
'https://doi.org/10.1016/S1473-3099(22)00001-1', 'Epidemiological study on the spread of ESBL-producing E. coli in Norwegian nursing homes.',
'publication, epidemiology, ESBL, Norway, nursing homes', '2022-05-15', 'author@niph.no',
'{"title": "Spread of ESBL E. coli in Norwegian Nursing Homes", "institution": "NIPH", "geographic_coverage": "Norway", "license": "Journal Copyright", "version": "N/A"}',
'Norway', 'Human'),

-- Publications -> policy_documents -> government_reports (Level 3 is leaf here)
('PUB-PD-GOV-SWE-2023', 'Publications', 'policy_documents', 'government_reports', NULL, NULL, 'PDF Report', 'N/A', 'FOHM Website',
'https://www.folkhalsomyndigheten.se/reports/amr-strategy-2023', 'Swedish government report outlining the national strategy against antimicrobial resistance 2023-2027.',
'publication, policy, government report, Sweden, AMR strategy', '2023-06-30', 'contact@fohm.se',
'{"title": "Swedish National AMR Strategy 2023-2027", "institution": "FOHM", "geographic_coverage": "Sweden", "license": "Government Publication", "version": "2023"}',
'Sweden', 'Human'),

-- Publications -> educational_resources -> online_courses (Level 3 is leaf here)
('PUB-ER-OC-DEN-2023', 'Publications', 'educational_resources', 'online_courses', NULL, NULL, 'MOOC Platform', 'N/A', 'Coursera',
'https://www.coursera.org/learn/one-health-amr-dk', 'Online course on One Health approaches to AMR, developed by Danish universities.',
'publication, education, online course, Denmark, One Health', '2023-09-01', 'contact@dtu.dk',
'{"title": "One Health AMR Online Course (Denmark)", "institution": "DTU", "geographic_coverage": "Denmark", "license": "Coursera Terms", "version": "1.0"}',
'Denmark', 'Human'),

-- Entities -> research_consortia -> international_initiatives (Level 3 is leaf here)
('ENT-RC-INT-NORD-2020', 'Entities', 'research_consortia', 'international_initiatives', NULL, NULL, 'Consortium Website', 'N/A', 'NoMoReAMR Website',
'https://nomoreamr.org', 'The NoMoReAMR consortium, a NordForsk funded international initiative.',
'entity, consortium, international, Nordic, NoMoReAMR', '2020-01-01', 'info@nomoreamr.org',
'{"title": "NoMoReAMR Consortium", "institution": "NordForsk", "geographic_coverage": "Nordic Countries", "license": "N/A", "version": "N/A"}',
'Norway', 'Human'), -- Assigning a primary country for DB

-- Entities -> data_repositories -> genomic_databases (Level 3 is leaf here)
('ENT-DR-GEN-ENA-1980', 'Entities', 'data_repositories', 'genomic_databases', NULL, NULL, 'Database Portal', 'N/A', 'ENA Website',
'https://www.ebi.ac.uk/ena/browser/home', 'European Nucleotide Archive (ENA) providing access to annotated DNA and RNA sequences.',
'entity, repository, genomic, ENA, international', '1980-01-01', 'datasubs@ebi.ac.uk',
'{"title": "European Nucleotide Archive (ENA)", "institution": "EMBL-EBI", "geographic_coverage": "International", "license": "Various", "version": "N/A"}',
'Sweden', 'Human'), -- Assigning a primary country for DB

-- Entities -> funding_bodies -> government_agencies (Level 3 is leaf here)
('ENT-FB-GOV-NOR-1990', 'Entities', 'funding_bodies', 'government_agencies', NULL, NULL, 'Agency Website', 'N/A', 'Research Council Norway',
'https://www.forskningsradet.no/en/', 'The Research Council of Norway, a major government funding agency for research.',
'entity, funding, government agency, Norway, RCN', '1990-01-01', 'post@forskningsradet.no',
'{"title": "Research Council of Norway (RCN)", "institution": "RCN", "geographic_coverage": "Norway", "license": "N/A", "version": "N/A"}',
'Norway', 'Human'),

-- Entities -> public_health_agencies -> national_health_institutes (Level 3 is leaf here)
('ENT-PHA-NAT-FIN-1982', 'Entities', 'public_health_agencies', 'national_health_institutes', NULL, NULL, 'Agency Website', 'N/A', 'THL Website',
'https://thl.fi/en/web/thlfi-en', 'Finnish Institute for Health and Welfare (THL), the national public health agency.',
'entity, public health, national institute, Finland, THL', '1982-01-01', 'info@thl.fi',
'{"title": "Finnish Institute for Health and Welfare (THL)", "institution": "THL", "geographic_coverage": "Finland", "license": "N/A", "version": "N/A"}',
'Finland', 'Human'),

-- Utilities -> bioinformatics -> sequence_assembly_pipelines (Level 3 is leaf here)
('UTIL-BIO-ASS-SPA-2021', 'Utilities', 'bioinformatics', 'sequence_assembly_pipelines', NULL, NULL, 'Software Pipeline', 'N/A', 'GitHub',
'https://github.com/ablab/spades', 'SPAdes genome assembler suitable for single-cell and standard datasets.',
'utility, bioinformatics, assembly, SPAdes, software', '2021-01-01', 'spades.support@cab.spbu.ru',
'{"title": "SPAdes Genome Assembler", "institution": "St. Petersburg State University", "geographic_coverage": "International", "license": "GPLv2", "version": "3.15.5"}',
'Denmark', 'Human'), -- Assigning a primary country for DB

-- Utilities -> geospatial -> GIS_mapping_tools (Level 3 is leaf here)
('UTIL-GEO-GIS-QGIS-2002', 'Utilities', 'geospatial', 'GIS_mapping_tools', NULL, NULL, 'Desktop Software', 'N/A', 'QGIS Website',
'https://qgis.org/en/site/', 'QGIS: A Free and Open Source Geographic Information System.',
'utility, geospatial, GIS, mapping, QGIS, software', '2002-01-01', 'info@qgis.org',
'{"title": "QGIS Desktop", "institution": "QGIS.org", "geographic_coverage": "International", "license": "GPLv2", "version": "3.34"}',
'Norway', 'Environment'), -- Assigning a primary country for DB

-- Utilities -> statistical -> machine_learning_algorithms (Level 3 is leaf here)
('UTIL-STA-ML-SKL-2007', 'Utilities', 'statistical', 'machine_learning_algorithms', NULL, NULL, 'Python Library', 'N/A', 'Scikit-learn Website',
'https://scikit-learn.org/stable/', 'Scikit-learn: Machine Learning in Python.',
'utility, statistical, machine learning, Python, scikit-learn', '2007-01-01', 'N/A',
'{"title": "Scikit-learn", "institution": "Inria", "geographic_coverage": "International", "license": "BSD-3-Clause", "version": "1.3.2"}',
'Sweden', 'Human'), -- Assigning a primary country for DB

-- Utilities -> data_management -> metadata_standards (Level 3 is leaf here)
('UTIL-DM-META-MIXS-2011', 'Utilities', 'data_management', 'metadata_standards', NULL, NULL, 'Standard Document', 'N/A', 'GSC Website',
'https://gensc.org/mixs/', 'Minimum Information about any (x) Sequence (MIxS) standard from the Genomic Standards Consortium.',
'utility, data management, metadata, standard, MIxS, GSC', '2011-01-01', 'info@gensc.org',
'{"title": "MIxS Standard", "institution": "Genomic Standards Consortium", "geographic_coverage": "International", "license": "CC BY 4.0", "version": "6.0"}',
'Finland', 'Human'), -- Assigning a primary country for DB

-- More Examples to reach 30+
-- Data -> omics_data -> genomic -> metagenomic -> human_fecal_metagenomes
('DTU-MWGS-FECAL-2023', 'Data', 'omics_data', 'genomic', 'metagenomic', 'human_fecal_metagenomes', 'FASTQ', 'high', 'SRA',
'https://www.ncbi.nlm.nih.gov/sra/PRJNA00002', 'Metagenomic sequencing of human fecal samples from a Danish cohort study on gut microbiome and AMR.',
'metagenomics, fecal, gut microbiome, AMR, Denmark', '2023-05-20', 'contact@dtu.dk',
'{"title": "Danish Gut Microbiome AMR Study (Fecal)", "institution": "DTU", "geographic_coverage": "Denmark", "license": "CC0", "version": "1.0"}',
'Denmark', 'Human'),

-- Data -> population_data -> disease_incidence -> respiratory_diseases (Level 4 is leaf here)
('THL-POP-DIS-RESP-2023', 'Data', 'population_data', 'disease_incidence', 'respiratory_diseases', NULL, 'API', 'national', 'THL Infectious Diseases Register',
'https://thl.fi/api/infectious-diseases/respiratory', 'National register data on respiratory disease incidence in Finland, updated weekly.',
'population data, disease incidence, respiratory, Finland, surveillance', '2023-12-31', 'contact@thl.fi',
'{"title": "Finland Respiratory Disease Incidence Register", "institution": "THL", "geographic_coverage": "Finland", "license": "Restricted", "version": "Ongoing"}',
'Finland', 'Human'),

-- Systems -> surveillance_network -> pathogen_tracking_systems -> syndromic_surveillance (Level 4 is leaf here)
('FOHM-SYS-SURV-SYND-2022', 'Systems', 'surveillance_network', 'pathogen_tracking_systems', 'syndromic_surveillance', NULL, 'Web Portal', 'national', 'Halsokoll',
'https://www.folkhalsomyndigheten.se/halsokoll', 'Swedish system for syndromic surveillance based on web queries and healthcare contacts.',
'systems, surveillance, syndromic, Sweden, public health', '2022-10-01', 'contact@fohm.se',
'{"title": "Halsokoll Syndromic Surveillance System", "institution": "FOHM", "geographic_coverage": "Sweden", "license": "Proprietary", "version": "2.1"}',
'Sweden', 'Human'),

-- Publications -> research_articles -> methodology_papers (Level 3 is leaf here)
('PUB-RA-METH-NMBU-2023', 'Publications', 'research_articles', 'methodology_papers', NULL, NULL, 'Journal Article', 'N/A', 'Bioinformatics Journal',
'https://doi.org/10.1093/bioinformatics/btad001', 'A new methodology paper describing a pipeline for AMR gene detection in complex metagenomes.',
'publication, methodology, bioinformatics, metagenomics, AMR detection', '2023-03-15', 'author@nmbu.no',
'{"title": "Pipeline for AMR Gene Detection in Metagenomes", "institution": "NMBU", "geographic_coverage": "Norway", "license": "Journal Copyright", "version": "N/A"}',
'Norway', 'Environment'),

-- Entities -> data_repositories -> antimicrobial_resistance_registry (Level 3 is leaf here)
('ENT-DR-AMR-SSI-2010', 'Entities', 'data_repositories', 'antimicrobial_resistance_registry', NULL, NULL, 'Database Search', 'N/A', 'DANMAP',
'https://www.danmap.org/search-database', 'DANMAP: Danish integrated antimicrobial resistance monitoring and research programme database.',
'entity, repository, AMR, registry, Denmark, DANMAP', '2010-01-01', 'danmap@ssi.dk',
'{"title": "DANMAP Database", "institution": "SSI/DTU", "geographic_coverage": "Denmark", "license": "Public Access", "version": "N/A"}',
'Denmark', 'Human');

-- Update metadata geographic_coverage just in case (redundant if done correctly above)
-- UPDATE data_points SET metadata = json_set(metadata, '$.geographic_coverage', country); -- This might fail if metadata is not valid JSON initially 