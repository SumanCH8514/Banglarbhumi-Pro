const ALL_DISTRICTS = [
  { code: '01', name_en: '[ 01 ] Bankura (BANKURA)', name_bn: '[ ০১ ] বাঁকুড়া (BANKURA)' },
  { code: '02', name_en: '[ 02 ] Purba Bardhaman (PURBA BARDHAMAN)', name_bn: '[ ০২ ] পূর্ব বর্ধমান (PURBA BARDHAMAN)' },
  { code: '03', name_en: '[ 03 ] Birbhum (BIRBHUM)', name_bn: '[ ০৩ ] বীরভূম (BIRBHUM)' },
  { code: '04', name_en: '[ 04 ] Darjeeling (DARJEELING)', name_bn: '[ ০৪ ] দার্জিলিং (DARJEELING)' },
  { code: '05', name_en: '[ 05 ] Howrah (HOWRAH)', name_bn: '[ ০৫ ] হাওড়া (HOWRAH)' },
  { code: '06', name_en: '[ 06 ] Hooghly (HOOGHLY)', name_bn: '[ ০৬ ] হুগলি (HOOGHLY)' },
  { code: '07', name_en: '[ 07 ] Jalpaiguri (JALPAIGURI)', name_bn: '[ ০৭ ] জলপাইগুড়ি (JALPAIGURI)' },
  { code: '08', name_en: '[ 08 ] Cooch Behar (COOCH BEHAR)', name_bn: '[ ০৮ ] কোচবিহার (COOCH BEHAR)' },
  { code: '09', name_en: '[ 09 ] Malda (MALDA)', name_bn: '[ ০৯ ] মালদা (MALDA)' },
  { code: '10', name_en: '[ 10 ] Paschim Medinipur (PASCHIM MEDINIPUR)', name_bn: '[ ১০ ] পশ্চিম মেদিনীপুর (PASCHIM MEDINIPUR)' },
  { code: '11', name_en: '[ 11 ] Purba Medinipur (PURBA MEDINIPUR)', name_bn: '[ ১১ ] পূর্ব মেদিনীপুর (PURBA MEDINIPUR)' },
  { code: '12', name_en: '[ 12 ] Murshidabad (MURSHIDABAD)', name_bn: '[ ১২ ] মুর্শিদাবাদ (MURSHIDABAD)' },
  { code: '13', name_en: '[ 13 ] Nadia (NADIA)', name_bn: '[ ১৩ ] নদিয়া (NADIA)' },
  { code: '14', name_en: '[ 14 ] Purulia (PURULIA)', name_bn: '[ ১৪ ] পুরুলিয়া (PURULIA)' },
  { code: '15', name_en: '[ 15 ] North 24 Parganas (NORTH 24 PGS)', name_bn: '[ ১৫ ] উত্তর ২৪ পরগনা (NORTH 24 PGS)' },
  { code: '16', name_en: '[ 16 ] South 24 Parganas (SOUTH 24 PGS)', name_bn: '[ ১৬ ] দক্ষিণ ২৪ পরগনা (SOUTH 24 PGS)' },
  { code: '17', name_en: '[ 17 ] Dakshin Dinajpur (DAKSHIN DINAJPUR)', name_bn: '[ ১৭ ] দক্ষিণ দিনাজপুর (DAKSHIN DINAJPUR)' },
  { code: '18', name_en: '[ 18 ] Uttar Dinajpur (UTTAR DINAJPUR)', name_bn: '[ ১৮ ] উত্তর দিনাজপুর (UTTAR DINAJPUR)' },
  { code: '19', name_en: '[ 19 ] Kolkata (KOLKATA)', name_bn: '[ ১৯ ] কলকাতা (KOLKATA)' },
  { code: '20', name_en: '[ 20 ] Alipurduar (ALIPURDUAR)', name_bn: '[ ২০ ] আলিপুরদুয়ার (ALIPURDUAR)' },
  { code: '21', name_en: '[ 21 ] Kalimpong (KALIMPONG)', name_bn: '[ ২১ ] কালিম্পং (KALIMPONG)' },
  { code: '22', name_en: '[ 22 ] Jhargram (JHARGRAM)', name_bn: '[ ২২ ] ঝাড়গ্রাম (JHARGRAM)' },
  { code: '23', name_en: '[ 23 ] Paschim Bardhaman (PASCHIM BARDHAMAN)', name_bn: '[ ২৩ ] পশ্চিম বর্ধমান (PASCHIM BARDHAMAN)' }
];

function getSlNum(code, text) {
  if (code !== undefined && code !== null) {
    const m = String(code).match(/\d+/);
    if (m) return parseInt(m[0], 10);
  }
  if (text) {
    const m = String(text).match(/\[\s*(\d+)\s*\]/);
    if (m) return parseInt(m[1], 10);
    const m2 = String(text).match(/\d+/);
    if (m2) return parseInt(m2[0], 10);
  }
  return 999999;
}

const blocksCache = {};
const mouzaCache = {};

async function fetchBlocksForDistrict(distCode) {
  if (blocksCache[distCode]) return blocksCache[distCode];
  try {
    const res = await fetch(`/api/v1/blocks?district=${encodeURIComponent(distCode)}`);
    const data = await res.json();
    if (data && data.blocks && data.blocks.length > 0) {
      const sortedBlocks = [...data.blocks].sort((a, b) => {
        const numA = getSlNum(a.bcode, a.text || a.name);
        const numB = getSlNum(b.bcode, b.text || b.name);
        if (numA !== numB) return numA - numB;
        return (a.text || a.name || '').localeCompare(b.text || b.name || '');
      });
      blocksCache[distCode] = sortedBlocks;
      return sortedBlocks;
    }
  } catch (e) { }
  return [];
}

async function fetchMouzasForBlock(distCode, blockCode) {
  const cacheKey = `${distCode}_${blockCode}`;
  if (mouzaCache[cacheKey]) return mouzaCache[cacheKey];
  try {
    const res = await fetch(`/api/v1/mouzas?district=${encodeURIComponent(distCode)}&block=${encodeURIComponent(blockCode)}`);
    const data = await res.json();
    if (data && data.mouzas && data.mouzas.length > 0) {
      const sortedMouzas = [...data.mouzas].sort((a, b) => {
        const numA = getSlNum(a.moucode, a.text || a.name);
        const numB = getSlNum(b.moucode, b.text || b.name);
        if (numA !== numB) return numA - numB;
        return (a.text || a.name || '').localeCompare(b.text || b.name || '');
      });
      mouzaCache[cacheKey] = sortedMouzas;
      return sortedMouzas;
    }
  } catch (e) { }
  return [];
}

const I18N = {
  en: {
    page_title: 'BanglarBhumi Pro • West Bengal Digital Land Records & Khatian Portal',
    top_gov: 'Government of West Bengal • পশ্চিমবঙ্গ সরকার',
    top_dept: 'Department of Land & Land Reforms • Land Records & Surveys',
    top_helpline: 'Helpline: 1800-345-5555 (Toll Free)',
    top_signin: 'Citizen Sign In',
    mobile_brand: 'BanglarBhumi Pro',
    mobile_tagline: 'a SumanOnline Project',
    mobile_menu_btn: '☰ Menu',
    nav_search: 'Search Records',
    nav_services: 'Citizen Services',
    nav_stats: 'Portal Stats',
    nav_guide: 'Due Diligence Guide',
    nav_classes: 'Land Classes',
    nav_presets: 'Sample Records',
    nav_faq: 'FAQs',
    nav_about: 'About Project',
    nav_portal_jump: 'Open Search Portal Directly',
    bulletin_badge: 'IMPORTANT NOTICE',
    bulletin_text: 'Under West Bengal Land Reforms Act 1955, cadastral maps, land ownership records and certified schedules are available online across all districts. • Contact your local BL&LRO office for conversion (Section 4C) and mutation. • Citizen Helpline: 1800-345-5555 (Toll Free).',
    widget_title: 'Know Your Property',
    widget_sub: 'Search digital land records directly by Khatian or Plot Number',
    btn_khatian: 'By Khatian No.',
    btn_plot: 'By Plot No.',
    lbl_dist: 'District:',
    lbl_block: 'Block / Thana:',
    lbl_mouza: 'Mouza & J.L.:',
    lbl_khatian_num: 'Khatian Number:',
    lbl_plot_num: 'Plot Number (Dag No):',
    ph_khatian: 'e.g., 101 or 101/A (Demo)',
    ph_plot: 'e.g., 205 or 205/1 (Demo)',
    btn_search: 'Search Records',
    feat_title: 'Sample Mouza Record • Kotulpur (JL 089)',
    feat_meta: 'Demo Khatian No: <strong>101/A</strong> • 4 Plots Sample Schedule (Demonstration)',
    feat_verified_badge: 'Demo Sample Record',
    feat_rayat_lbl: 'Rayat Name:',
    feat_rayat_val: 'Demo Citizen (Sample Rayat)',
    feat_father_lbl: 'Father/Husband:',
    feat_father_val: 'Demo Guardian / Father',
    feat_owner_lbl: 'Ownership Type:',
    feat_owner_val: 'Individual Ownership (Byakti - Demo)',
    feat_area_lbl: 'Total Land Area:',
    feat_area_val: '0.36 Acre (Sample Area)',
    scroll_hint: '↔ Scroll horizontally to view full schedule',
    th_dag: 'Plot No (Dag)',
    th_class: 'Land Class',
    th_share: 'Share',
    th_area: 'Area (Acre)',
    th_possessor: 'Possession / Occupant Status',
    th_remarks: 'Remarks & Section',
    btn_map: 'Map',
    cl_shale_val: 'Shale (শালি)',
    badge_anumati: 'Permission (Anumati)',
    status_direct: 'Direct Possession (Nij)',
    sec5_remark: 'Section 5(1) Remarks',
    feat_notice: '* Demonstration record with simulated data for citizen privacy. Detailed schedule includes plot classification, area share and possessor remarks.',
    btn_full_sched: 'Open Sample Schedule in Search Portal →',
    services_heading: 'Citizen Services & Record Inspection Modules',
    services_sub: 'Modern digital land governance services of Government of West Bengal',
    serv1_title: 'Record of Rights (RoR / Khatian Search)',
    serv1_desc: 'Search by Khatian number to view owner\'s full legal name, father or husband\'s name, address, and all plots owned under the Mouza.',
    serv1_link: 'Start Khatian Search →',
    serv2_title: 'Cadastral Plot Map (Mouza Naksha)',
    serv2_desc: 'Interactive cadastral vector parcel map displaying boundary pillars, adjacent survey plots, north compass orientation, and right-of-way roads.',
    serv2_link: 'Inspect Parcel Map →',
    serv3_title: 'Plot Possession & Occupancy Verification',
    serv3_desc: 'Instant audit of recorded possessor entries, permissive tenancy, legal status and Section 50/51 occupancy records.',
    serv3_link: 'Check Occupancy Status →',
    serv4_title: 'Certified Schedule & Print Copy',
    serv4_desc: 'Official government revenue format with bilingual column headers, digital department seal, watermark, and one-click print/PDF download.',
    serv4_link: 'Certified Copy Layout →',
    stats_heading: 'West Bengal Land Records Digitization Statistics',
    stats_sub: 'Overview of state-wide revenue administration and mouza database coverage',
    stat1_num: '23',
    stat1_lbl: 'Administrative Districts',
    stat1_desc: 'From Darjeeling to South 24 Parganas fully digitized',
    stat2_num: '342',
    stat2_lbl: 'Revenue Blocks & BL&LRO Offices',
    stat2_desc: 'Block Land & Land Reforms Officer revenue jurisdictions',
    stat3_num: '42,048',
    stat3_lbl: 'Digitized Mouza Maps',
    stat3_desc: 'Vector cadastral parcels preserved with survey coordinates',
    stat4_num: '3.7+ Crore',
    stat4_lbl: 'Digitized RoR Records',
    stat4_desc: 'Searchable in real-time on live database',
    guide_heading: 'Citizen & Surveyor Due-Diligence: 3 Essential Steps',
    guide_sub: 'Critical verification procedure prior to land purchase, registration, or title transfer',
    step1_pill: 'STEP 01',
    step1_title: 'Verify Khatian & Rayat Ownership',
    step1_desc: 'Search by Mouza and Khatian number to confirm the owner\'s legal name, father or husband\'s name, and total land share. Cross-reference the seller\'s deed spelling against active revenue records.',
    step2_pill: 'STEP 02',
    step2_title: 'Verify Land Classification & Occupancy',
    step2_desc: 'Check official revenue classification (Shale, Danga, Bastu, Pukur) and recorded occupant status on each plot schedule before entering into any sale deed or title transfer.',
    step3_pill: 'STEP 03',
    step3_title: 'Inspect Boundaries on Cadastral Map',
    step3_desc: 'Click the \'Map\' button beside the plot to view parcel geometry, survey boundary pillars, adjacent survey numbers, and physical access road or water drainage on the ground.',
    class_heading: 'West Bengal Land Classification & Revenue Rules Guide',
    class_sub: 'Land nature definitions and conversion guidelines under Section 4C (WBLR Act 1955)',
    th_cl_class: 'Classification',
    th_cl_nature: 'Nature of Land & Use',
    th_cl_rule: 'Statutory Rule & Practical Implication',
    th_cl_conv: 'Conversion (Sec 4C)',
    cl1_name: 'Bastu (বাস্তু)',
    cl1_tag: 'Residential',
    cl1_desc: 'Land designated for homestead, residential building, or dwelling.',
    cl1_rule: 'Subject to building codes if converted to non-residential or commercial purposes.',
    cl1_conv: 'Not Applicable (already recorded residential)',
    cl1_conv_short: 'Conversion: Not Applicable (residential)',
    cl2_name: 'Shale (শালি)',
    cl2_tag: 'Mono-Crop Agri',
    cl2_desc: 'Single-crop agricultural land, predominantly monsoon rain-fed cultivation.',
    cl2_rule: 'Prior approval from BL&LRO required before putting land to non-agricultural use.',
    cl2_conv: 'Subject to permission under Section 4C',
    cl2_conv_short: 'Conversion: Under Section 4C approval',
    cl3_name: 'Dhani / Suna (ধানি / সুনা)',
    cl3_tag: 'Multi-Crop Fertile',
    cl3_desc: 'Fertile multi-crop farmland producing paddy and rotational staple harvests.',
    cl3_rule: 'Strict statutory restrictions applied to protect agricultural food security.',
    cl3_conv: 'Conversion severely restricted except special projects',
    cl3_conv_short: 'Conversion: Severely restricted',
    cl4_name: 'Danga (ডাঙা)',
    cl4_tag: 'High / Arid',
    cl4_desc: 'Elevated, arid, or semi-cultivated terrain.',
    cl4_rule: 'Well-suited for horticulture, agro-forestry, or conversion to residential homestead.',
    cl4_conv: 'Subject to BL&LRO statutory approval',
    cl4_conv_short: 'Conversion: Subject to BL&LRO approval',
    cl5_name: 'Bagan (বাগান)',
    cl5_tag: 'Orchard / Plantation',
    cl5_desc: 'Fruit orchard, bamboo grove, or tree plantation land.',
    cl5_rule: 'Specific permissions from Forest Dept and Revenue Dept required for felling trees.',
    cl5_conv: 'Subject to statutory permission',
    cl5_conv_short: 'Conversion: Subject to permission',
    cl6_name: 'Pukur / Waterbody (পুকুর)',
    cl6_tag: 'Filling Strictly Banned',
    cl6_desc: 'Permanent pond, reservoir, lake, or inland fishery wetland.',
    cl6_rule: 'Under West Bengal Inland Fisheries Act, filling or draining water bodies is a criminal offense.',
    cl6_conv: 'Filling & Conversion Strictly Prohibited',
    cl6_conv_short: 'Conversion: Strictly Prohibited & Criminal Offense',
    presets_heading: 'Verified Sample Mouzas & Test Records',
    presets_sub: 'Load pre-verified revenue parcels instantly with one click',
    p1_dist: 'Bankura',
    p1_tag: 'Verified Schedule',
    p1_pill_khatian: 'Demo Khatian: 101/A',
    p1_pill_plots: '4 Plots (Demo)',
    p1_btn: 'Load Record →',
    p2_dist: 'Bankura',
    p2_tag: 'Sample Plot',
    p2_pill_dag: 'Plot No: 101 (Demo)',
    p2_pill_class: 'Shale Class',
    p2_btn: 'Load Record →',
    p3_dist: 'Hooghly',
    p3_tag: 'Sample Farmland',
    p3_pill_dag: 'Plot No: 101 (Demo)',
    p3_pill_class: 'Agri Parcel',
    p3_btn: 'Load Record →',
    p4_dist: 'South 24 Parganas',
    p4_tag: 'Sample Parcel',
    p4_pill_dag: 'Plot No: 101 (Demo)',
    p4_pill_class: 'Revenue Schedule',
    p4_btn: 'Load Record →',
    faq_heading: 'Frequently Asked Questions (FAQs)',
    faq_sub: 'Common citizen queries regarding West Bengal land records',
    q1_title: '1. What is the fundamental difference between Plot Search and Khatian Search?',
    q1_ans: '<strong>Plot Search (দাগের তথ্য):</strong> Reveals all co-sharers in a specific survey plot, their exact ownership share and acreage, and recorded possessor details on that plot.<br><br><strong>Khatian Search (খতিয়ানের তথ্য):</strong> Displays the complete ownership ledger of an individual owner (Rayat) in that mouza, showing the consolidated schedule of all plots owned by that rayat.',
    q2_title: '2. What is Section 4C Land Conversion and why is it required?',
    q2_ans: 'Under Section 4C of the West Bengal Land Reforms Act 1955, changing the recorded character or use of land (such as agricultural Shale or Danga to Bastu or Commercial) requires prior written permission from the competent BL&LRO. Converting waterbodies or agricultural land without sanction is strictly unlawful.',
    q3_title: '3. What is a Bata Plot (বাটা দাগ) and how do you search for it?',
    q3_ans: 'When an original survey plot is subdivided after the survey settlement, a fractional Bata Plot is created (such as 165/1 or 522/2). You can enter \'165/1\' directly or place \'165\' as the main number and \'1\' in the fractional input.',
    q4_title: '4. How does the Cadastral Plot Map function?',
    q4_ans: 'Clicking the \'Map\' button beside any plot loads the digital cadastral vector map. It reveals parcel boundaries, adjacent plot numbers, boundary pillars, north direction orientation, and road connectivity.',
    q5_title: '5. How to download or print Certified Schedule copies?',
    q5_ans: 'Once search results appear, click \'Print Schedule\' or \'Download PDF\' to generate an official government format A4-sized printable PDF with digital seal and watermark.',
    ft_dept: 'Directorate of Land Records & Surveys',
    ft_desc: 'Department of Land & Land Reforms and Refugee Relief & Rehabilitation, Government of West Bengal.<br>Survey Building, 35 Gopal Nagar Road, Alipore, Kolkata - 700027.',
    ft_connected: '● Connected to all 23 District Land Revenue Databases',
    ft_nav_title: 'Navigation',
    ft_samples_title: 'Sample Districts',
    ft_notice_title: 'Statutory Notice',
    ft_disclaimer: 'Information displayed on this portal is retrieved in real-time from the official Land Records & Surveys database of the Government of West Bengal. For clerical rectifications, the order of the competent BL&LRO is final.',
    ft_copy: '<b>© 2026 BanglarBhumi Pro</b> | All rights reserved.',
    ft_audience: ' Designed and Maintained by <b>SumanOnline Web Services</b>'
  },
  bn: {
    page_title: 'বাংলারভূমি প্রো • পশ্চিমবঙ্গ ডিজিটাল ভূমি রেকর্ড ও খতিয়ান পোর্টাল',
    top_gov: 'Government of West Bengal • পশ্চিমবঙ্গ সরকার',
    top_dept: 'ভূমি ও ভূমি সংস্কার দপ্তর • ডিরেক্টরেট অফ ল্যান্ড রেকর্ডস অ্যান্ড সার্ভেস',
    top_helpline: 'টোল ফ্রি হেল্পলাইন: ১৮০০-৩৪৫-৫৫৫৫',
    top_signin: 'নাগরিক সাইন-ইন',
    mobile_brand: 'বাংলারভূমি প্রো',
    mobile_tagline: 'a SumanOnline Project',
    mobile_menu_btn: '☰ মেনু',
    nav_search: 'রেকর্ড অনুসন্ধান (Search)',
    nav_services: 'নাগরিক সেবা (Services)',
    nav_stats: 'পরিসংখ্যান (Stats)',
    nav_guide: 'যাচাই নির্দেশিকা (Guide)',
    nav_classes: 'জমির শ্রেণি (Classes)',
    nav_presets: 'নমুনা মৌজা (Samples)',
    nav_faq: 'প্রশ্নোত্তর (FAQs)',
    nav_about: 'প্রকল্পের বিবরণ',
    nav_portal_jump: 'সরাসরি সার্চ পোর্টালে যান',
    bulletin_badge: 'জরুরি বিজ্ঞপ্তি',
    bulletin_text: 'পশ্চিমবঙ্গ ভূমি সংস্কার আইন (WBLR Act 1955) অনুযায়ী সমস্ত জেলার দাগের ক্যাডাস্ট্রাল ম্যাপ নকশা, জমির স্বত্বাধিকার রেকর্ড এবং সার্টিফাইড খতিয়ান তফসিল ডিজিটাল পোর্টালে উপলব্ধ। • নোটিশ: দাগের রূপান্তর (Section 4C) ও নামপত্তনের জন্য সংশ্লিষ্ট ব্লক BL&LRO অফিসে যোগাযোগ করুন। • সার্বক্ষণিক নাগরিক হেল্পডেস্ক (টোল ফ্রি): ১৮০০-৩৪৫-৫৫৫৫।',
    widget_title: 'আপনার সম্পত্তি জানুন',
    widget_sub: 'খতিয়ান বা দাগ নম্বর দিয়ে সরাসরি জমির তথ্য দেখুন',
    btn_khatian: 'খতিয়ান অনুযায়ী',
    btn_plot: 'দাগ নম্বর অনুযায়ী',
    lbl_dist: 'জেলা (District):',
    lbl_block: 'ব্লক / থানা (Block):',
    lbl_mouza: 'মৌজা ও জে.এল. (Mouza & J.L.):',
    lbl_khatian_num: 'খতিয়ান নম্বর (Khatian No.):',
    lbl_plot_num: 'দাগ নম্বর (Plot No.):',
    ph_khatian: 'যেমন: 101 বা 101/A (ডেমো)',
    ph_plot: 'যেমন: 205 বা 205/1 (ডেমো)',
    btn_search: 'অনুসন্ধান করুন (Search Records)',
    feat_title: 'নমুনা মৌজা রেকর্ড • কোতুলপুর (০৮৯)',
    feat_meta: 'নমুনা খতিয়ান নম্বর: <strong>১০১/ক</strong> • ৪টি দাগের ডেমো তফসিল',
    feat_verified_badge: 'নমুনা ডেমো রেকর্ড',
    feat_rayat_lbl: 'রায়তের নাম:',
    feat_rayat_val: 'নমুনা নাগরিক (ডেমো রায়ত)',
    feat_father_lbl: 'পিতা/স্বামীর নাম:',
    feat_father_val: 'নমুনা অভিভাবক / পিতা',
    feat_owner_lbl: 'রায়তের ধরন:',
    feat_owner_val: 'ব্যক্তিগত মালিকানা (ডেমো)',
    feat_area_lbl: 'মোট জমির পরিমাণ:',
    feat_area_val: '০.৩৬ একর (নমুনা পরিমাণ)',
    scroll_hint: '↔ সম্পূর্ণ তফসিল দেখতে ডানে-বামে স্ক্রোল করুন',
    th_dag: 'দাগ নম্বর (Dag No)',
    th_class: 'জমির শ্রেণি (Class)',
    th_share: 'অংশ (Share)',
    th_area: 'অংশের পরিমাণ (Acre)',
    th_possessor: 'দখলদার স্থিতি (Possession Status)',
    th_remarks: 'মন্তব্য ও ধারা',
    btn_map: 'ম্যাপ',
    cl_shale_val: 'শালি (Shale)',
    badge_anumati: 'অনুমতি (Anumati)',
    status_direct: 'নিজ দখল (Direct)',
    sec5_remark: 'ধারা ৫(১) মন্তব্য (Remarks)',
    feat_notice: '* তথ্যের গোপনীয়তা বজায় রাখার স্বার্থে এটি একটি কৃত্রিম ডেমো রেকর্ড। বিস্তারিত তফসিলে জমির শ্রেণি, অংশ ও দখলদার বিবরণ অন্তর্ভুক্ত থাকে।',
    btn_full_sched: 'সার্চ পোর্টালে নমুনা তফসিল খুলুন →',
    services_heading: 'নাগরিক সেবা ও রেকর্ড পরিদর্শন মডিউল',
    services_sub: 'পশ্চিমবঙ্গ ভূমি ও ভূমি সংস্কার দপ্তরের আধুনিক ডিজিটাল পরিষেবা',
    serv1_title: 'খতিয়ানের রেকর্ড (RoR Search)',
    serv1_desc: 'খতিয়ান নম্বর দিয়ে অনুসন্ধান করে রায়তের পূর্ণ নাম, পিতা বা স্বামীর নাম, ঠিকানা এবং সংশ্লিষ্ট মৌজার অন্তর্গত সমস্ত অন্তর্ভুক্ত দাগের খতিয়ান তালিকা দেখুন।',
    serv1_link: 'খতিয়ান অনুসন্ধান শুরু করুন →',
    serv2_title: 'দাগের ক্যাডাস্ট্রাল ম্যাপ নকশা',
    serv2_desc: 'নির্দিষ্ট দাগের জ্যামিতিক নকশা, সংলগ্ন পার্সেলের অবস্থান (চতুঃসীমা), সীমানা স্তম্ভ এবং উত্তর দিক নির্ণায়ক কম্পাস সমন্বিত ডিজিটাল ক্যাডাস্ট্রাল ম্যাপ প্রদর্শন।',
    serv2_link: 'ম্যাপ নকশা দেখুন →',
    serv3_title: 'দাগের দখলদার ও স্বত্ব নিরীক্ষা',
    serv3_desc: 'মৌজা খতিয়ান তফসিলে উল্লিখিত বৈধ দখলদার এন্ট্রি, স্বত্বাধিকার এবং ভূমি রাজস্ব আইনের প্রাসঙ্গিক বিধিবদ্ধ তথ্যের তাৎক্ষণিক নিরীক্ষা।',
    serv3_link: 'দখলদার তথ্য জানুন →',
    serv4_title: 'সার্টিফাইড তফসিল ও প্রিন্ট কপি',
    serv4_desc: 'অফিসিয়াল ভূমি রেকর্ড ফরম্যাটে ইংরেজি ও বাংলা কলাম টাইটেল, সরকারি সিলমোহর, ওয়াটারমার্ক এবং লিগ্যাল সাইজ প্রিন্ট/পিডিএফ এক ক্লিকে ডাউনলোড।',
    serv4_link: 'সার্টিফাইড কপি ফরম্যাট →',
    stats_heading: 'পশ্চিমবঙ্গ ভূমি রেকর্ড ডিজিটাইজেশন পরিসংখ্যান',
    stats_sub: 'রাজ্য জুড়ে বিস্তৃত প্রশাসনিক ও মৌজা ডাটাবেসের সামগ্রিক তথ্য',
    stat1_num: '২৩',
    stat1_lbl: 'প্রশাসনিক জেলা (Districts)',
    stat1_desc: 'দার্জিলিং থেকে সুন্দরবন পর্যন্ত সমস্ত জেলা অন্তর্ভুক্ত',
    stat2_num: '৩৪২',
    stat2_lbl: 'রাজস্ব ব্লক ও BL&LRO অফিস',
    stat2_desc: 'ব্লক ভূমি ও ভূমি সংস্কার আধিকারিক ক্ষেত্র',
    stat3_num: '৪২,০৪৮',
    stat3_lbl: 'ডিজিটাল মৌজা ম্যাপ (Mouzas)',
    stat3_desc: 'ক্যাডাস্ট্রাল ভেক্টর পার্সেল নকশা সহ সংরক্ষিত',
    stat4_num: '৩.৭+ কোটি',
    stat4_lbl: 'ডিজিটাইজড খতিয়ান রেকর্ড',
    stat4_desc: 'লাইভ ডাটাবেসে রিয়েল-টাইম সার্চ সুবিধাযুক্ত',
    guide_heading: 'নাগরিক ও সার্ভেয়ার নির্দেশিকা: জমি যাচাইয়ের ৩টি মূল ধাপ',
    guide_sub: 'জমি কেনাবেচা, রেজিস্ট্রি বা স্বত্ব হস্তান্তরের পূর্বে সতর্কতামূলক পরীক্ষা',
    step1_pill: 'ধাপ ০১',
    step1_title: 'খতিয়ান ও রায়তের স্বত্ব যাচাই',
    step1_desc: 'মৌজা এবং খতিয়ান নম্বর দিয়ে অনুসন্ধান করে রায়তের পূর্ণ নাম, পিতা বা স্বামীর নাম এবং মোট জমির পরিমাণ পরীক্ষা করুন। বিক্রেতার নামের বানানের সাথে রেকর্ডের রায়তের নাম মিলিয়ে নেওয়া জরুরি।',
    step2_pill: 'ধাপ ০২',
    step2_title: 'জমির শ্রেণি ও দখলদার নিরীক্ষা',
    step2_desc: 'যেকোনো জমি ক্রয় বা চুক্তি করার পূর্বে প্রতিটি দাগের অফিশিয়াল রাজস্ব শ্রেণি (শালি, ডাঙা, পুকুর, বাগান) এবং দখলদার কলামের তথ্য নিবিড়ভাবে যাচাই করুন।',
    step3_pill: 'ধাপ ০৩',
    step3_title: 'ক্যাডাস্ট্রাল ম্যাপ নকশায় দাগের চৌহদ্দি',
    step3_desc: 'পোর্টালে দাগের পাশে থাকা \'ম্যাপ\' বোতামে ক্লিক করে দাগের জ্যামিতিক নকশা, সীমানা স্তম্ভ, সংলগ্ন দাগসমূহ এবং প্রবেশের সরকারি রাস্তা বা নালা আছে কিনা তা সরেজমিনে মিলিয়ে নিন।',
    class_heading: 'পশ্চিমবঙ্গে জমির শ্রেণিবিভাগ ও রাজস্ব বিধিমালার গাইড',
    class_sub: 'ভূমি ব্যবহারের ধরন ও ধারা ৪সি (Sec 4C WBLR Act) সংক্রান্ত তথ্য',
    th_cl_class: 'শ্রেণি (Classification)',
    th_cl_nature: 'ব্যবহার ও বৈশিষ্ট্য (Nature of Land)',
    th_cl_rule: 'আইনি তাৎপর্য ও ব্যবহারিক বিধি (Statutory Rule)',
    th_cl_conv: 'শ্রেণি পরিবর্তন (Conversion)',
    cl1_name: 'বাস্তু (Bastu)',
    cl1_tag: 'আবাসিক বাস্তু',
    cl1_desc: 'বসতবাড়ি, ঘরবাড়ি বা আবাসিক ব্যবহারের জন্য নির্ধারিত জমি।',
    cl1_rule: 'অনাবাসিক নির্মাণ বা বাণিজ্যিক কাজে ব্যবহারের জন্য উপযুক্ত বিধি প্রযোজ্য।',
    cl1_conv: 'প্রযোজ্য নয় (আবাসিক হিসেবে নথিভুক্ত)',
    cl1_conv_short: 'শ্রেণি রূপান্তর: প্রযোজ্য নয় (আবাসিক নথিভুক্ত)',
    cl2_name: 'শালি (Shale)',
    cl2_tag: 'একফসলি কৃষি',
    cl2_desc: 'একফসলি কৃষিজমি; সাধারণত বর্ষাভিত্তিক চাষাবাদ হয়।',
    cl2_rule: 'কৃষিকাজের বাইরে অন্য উদ্দেশ্যে ব্যবহারে বিএলঅ্যান্ডএলআরও অনুমতি আবশ্যক।',
    cl2_conv: 'ধারা ৪সি অনুযায়ী অনুমতি সাপেক্ষ',
    cl2_conv_short: 'শ্রেণি রূপান্তর: ধারা ৪সি অনুযায়ী অনুমতি সাপেক্ষ',
    cl3_name: 'ধানি / সুনা (Dhani / Suna)',
    cl3_tag: 'বহুফসলি উর্বর',
    cl3_desc: 'উর্বর দোফসলি বা তিনফসলি কৃষিজমি যেখানে ধান ও অন্যান্য ফসল উৎপাদিত হয়।',
    cl3_rule: 'কৃষি সুরক্ষার স্বার্থে যথেচ্ছ পরিবর্তন বিধিনিষেধের আওতাধীন।',
    cl3_conv: 'বিশেষ ক্ষেত্র ব্যতীত রূপান্তর সীমিত',
    cl3_conv_short: 'শ্রেণি রূপান্তর: বিশেষ ক্ষেত্র ব্যতীত রূপান্তর সীমিত',
    cl4_name: 'ডাঙা (Danga)',
    cl4_tag: 'উঁচু অনাবাদি',
    cl4_desc: 'উঁচু জমি, টিলা বা শুষ্ক অনাবাদি/আধা-আবাদি জমি।',
    cl4_rule: 'উদ্যানপালন, গাছপালা বা উপযুক্ত প্রক্রিয়ায় আবাসিক রূপান্তরের সুযোগ রয়েছে।',
    cl4_conv: 'বিএলঅ্যান্ডএলআরও অনুমোদন সাপেক্ষ',
    cl4_conv_short: 'শ্রেণি রূপান্তর: বিএলঅ্যান্ডএলআরও অনুমোদন সাপেক্ষ',
    cl5_name: 'বাগান (Bagan)',
    cl5_tag: 'বাগান বা বৃক্ষ',
    cl5_desc: 'ফলের বাগান, বাঁশবন বা বৃক্ষরোপণ করা স্থায়ী জমি।',
    cl5_rule: 'গাছপালা কাটার ক্ষেত্রে বন দপ্তর ও ভূমি দপ্তরের সুনির্দিষ্ট নিয়ম প্রযোজ্য।',
    cl5_conv: 'অনুমতি সাপেক্ষ',
    cl5_conv_short: 'শ্রেণি রূপান্তর: অনুমতি সাপেক্ষ',
    cl6_name: 'পুকুর / জলাশয় (Pukur)',
    cl6_tag: 'ভরাট সম্পূর্ণ নিষিদ্ধ',
    cl6_desc: 'স্থায়ী জলাশয়, দীঘি বা মৎস্যচাষের জলভূমি।',
    cl6_rule: 'পশ্চিমবঙ্গ অন্তর্বর্তী জলাশয় সংরক্ষণ আইন অনুযায়ী পুকুর ভরাট সম্পূর্ণ নিষিদ্ধ ও দণ্ডনীয় অপরাধ।',
    cl6_conv: 'ভরাট ও রূপান্তর সম্পূর্ণ নিষিদ্ধ',
    cl6_conv_short: 'শ্রেণি রূপান্তর: ভরাট ও রূপান্তর সম্পূর্ণ নিষিদ্ধ',
    presets_heading: 'যাচাইকৃত নমুনা মৌজা ও টেস্ট রেকর্ড',
    presets_sub: 'পোর্টালে তাৎক্ষণিক অনুসন্ধানের জন্য এক ক্লিকে লোড করুন',
    p1_dist: 'বাঁকুড়া (Bankura)',
    p1_tag: 'যাচাইকৃত তফসিল',
    p1_pill_khatian: 'ডেমো খতিয়ান: ১০১/ক',
    p1_pill_plots: '৪টি দাগ (ডেমো)',
    p1_btn: 'রেকর্ড লোড করুন →',
    p2_dist: 'বাঁকুড়া (Bankura)',
    p2_tag: 'নমুনা দাগ',
    p2_pill_dag: 'দাগ নম্বর: ১০১ (ডেমো)',
    p2_pill_class: 'শালি শ্রেণি',
    p2_btn: 'রেকর্ড লোড করুন →',
    p3_dist: 'হুগলি (Hooghly)',
    p3_tag: 'নমুনা কৃষিজমি',
    p3_pill_dag: 'দাগ নম্বর: ১০১ (ডেমো)',
    p3_pill_class: 'কৃষি পার্সেল',
    p3_btn: 'রেকর্ড লোড করুন →',
    p4_dist: 'দক্ষিণ ২৪ পরগনা',
    p4_tag: 'নমুনা পার্সেল',
    p4_pill_dag: 'দাগ নম্বর: ১০১ (ডেমো)',
    p4_pill_class: 'রাজস্ব তফসিল',
    p4_btn: 'রেকর্ড লোড করুন →',
    faq_heading: 'সাধারণ নাগরিকের সচরাচর জিজ্ঞাস্য (FAQs)',
    faq_sub: 'পশ্চিমবঙ্গে ভূমি রেকর্ড সংক্রান্ত প্রচলিত প্রশ্নের উত্তর',
    q1_title: '১. দাগের তথ্য এবং খতিয়ানের তথ্যের মধ্যে মৌলিক পার্থক্য কী?',
    q1_ans: '<strong>দাগের তথ্য (Plot Search):</strong> নির্দিষ্ট একটি দাগ বা প্লটে কে কে অংশীদার রয়েছে, তাদের কার কতটুকু জমির অংশ ও পরিমাণ এবং ওই দাগের দখলদার তথ্য প্রকাশ করে।<br><br><strong>খতিয়ানের তথ্য (Khatian Search):</strong> একজন নির্দিষ্ট জমির মালিক বা রায়তের মৌজাভুক্ত খতিয়ানের পূর্ণ হিসাবপত্র তুলে ধরে, যেখানে তার মালিকানাধীন সমস্ত দাগের সম্মিলিত তালিকা প্রদর্শিত হয়।',
    q2_title: '২. ৪সি ধারা অনুযায়ী জমির রূপান্তর (Conversion) কী এবং কেন এটি প্রয়োজন?',
    q2_ans: 'পশ্চিমবঙ্গ ভূমি সংস্কার আইন ১৯৫৫-এর ধারা ৪সি অনুসারে জমির বর্তমান ব্যবহারের শ্রেণি (যেমন শালি বা ডাঙা থেকে বাস্তু বা বাণিজ্যিক) পরিবর্তন করতে হলে সংশ্লিষ্ট ব্লক ভূমি ও ভূমি সংস্কার আধিকারিক (BL&LRO)-এর পূর্বানুমতি বাধ্যতামূলক। কোনো পুকুর বা জলাশয় ভরাট করা বা অনুমতি ছাড়া রূপান্তর আইনত দণ্ডনীয় অপরাধ।',
    q3_title: '৩. বাটা দাগ (Bata Plot) কী এবং এটি কীভাবে সার্চ করবেন?',
    q3_ans: 'জরিপের পরবর্তী সময়ে কোনো মূল দাগ বিভক্ত হলে বা ভগ্নাংশ তৈরি হলে বাটা দাগ গঠিত হয় (যেমন: ১৬৫/১ বা ৫২২/২)। সার্চ বক্সে মূল দাগ নম্বর এবং বাটা অংশে ভগ্নাংশ বসিয়ে বা \'১৬৫/১\' লিখে সরাসরি অনুসন্ধান করা সম্ভব।',
    q4_title: '৪. দাগের ক্যাডাস্ট্রাল ম্যাপ নকশা কীভাবে কাজ করে?',
    q4_ans: 'পোর্টালে দাগের পাশে থাকা \'ম্যাপ\' বোতামে ক্লিক করলে ডিজিটাল ক্যাডাস্ট্রাল ভেক্টর ম্যাপ নকশা প্রদর্শিত হয়। এতে নির্বাচিত দাগের চতুঃসীমা, সংলগ্ন পাশের দাগসমূহ, সীমানা স্তম্ভ এবং উত্তর দিক সমন্বিত পূর্ণ বিবরণ ফুটে ওঠে।',
    q5_title: '৫. সার্টিফাইড প্রিন্ট কপি কীভাবে ডাউনলোড বা সংরক্ষণ করবেন?',
    q5_ans: 'অনুসন্ধানের ফলাফল প্রদর্শিত হলে \'Download PDF\' বা \'Print Schedule\' বোতামে ক্লিক করলেই অফিশিয়াল সরকারি খতিয়ান ফরম্যাটে A4 সাইজের প্রিন্ট-রেডি পিডিএফ সংরক্ষণ করা যায়।',
    ft_dept: 'ডিরেক্টরেট অফ ল্যান্ড রেকর্ডস অ্যান্ড সার্ভেস',
    ft_desc: 'ভূমি ও ভূমি সংস্কার এবং উদ্বাস্তু ত্রাণ ও পুনর্বাসন দপ্তর, পশ্চিমবঙ্গ সরকার।<br>সার্ভে বিল্ডিং, ৩৫ গোপাল নগর রোড, আলিপুর, কলকাতা - ৭০০০২৭।',
    ft_connected: '● রাজ্যের ২৩টি জেলার ডিজিটাল ভূমি ডাটাবেসের সাথে সংযুক্ত',
    ft_nav_title: 'নেভিগেশন',
    ft_samples_title: 'নমুনা জেলা',
    ft_notice_title: 'বিধিবদ্ধ নোটিশ',
    ft_disclaimer: 'পোর্টালে প্রদর্শিত তথ্য পশ্চিমবঙ্গ সরকারের ল্যান্ড রেকর্ডস অ্যান্ড সার্ভেস দপ্তরের ডাটাবেস অনুযায়ী পরিবেশিত। কোনো ক্লারিক্যাল সংশোধনের ক্ষেত্রে উপযুক্ত বিএলঅ্যান্ডএলআরও দপ্তরের নির্দেশ চূড়ান্ত বলে গণ্য হবে।',
    ft_copy: '© ২০২৬ বাংলারভূমি প্রো • A SumanOnline Platform • সর্বস্বত্ব সংরক্ষিত।',
    ft_audience: 'Designed for Citizens, Surveyors & Legal Practitioners of West Bengal'
  }
};

let currentPortalLang = 'en';
let currentWidgetMode = 'khatian';

function setPortalLanguage(lang) {
  if (lang !== 'en' && lang !== 'bn') lang = 'en';
  currentPortalLang = lang;
  try {
    localStorage.setItem('wb_portal_lang', lang);
  } catch (e) { }

  document.documentElement.lang = lang;

  const btnEn = document.getElementById('btnLangEn');
  const btnBn = document.getElementById('btnLangBn');
  if (btnEn && btnBn) {
    if (lang === 'en') {
      btnEn.classList.add('active');
      btnBn.classList.remove('active');
    } else {
      btnBn.classList.add('active');
      btnEn.classList.remove('active');
    }
  }

  const dict = I18N[lang] || I18N.en;

  if (dict.page_title) {
    document.title = dict.page_title;
  }

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key] !== undefined) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.value = dict[key];
      } else {
        el.innerHTML = dict[key];
      }
    }
  });

  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const key = el.getAttribute('data-i18n-ph');
    if (dict[key] !== undefined) {
      el.placeholder = dict[key];
    }
  });

  updateDistrictSelectOptions();
}

function updateDistrictSelectOptions() {
  const distSelect = document.getElementById('widgetDistrict');
  if (!distSelect) return;
  const currentVal = distSelect.value || '01';

  distSelect.innerHTML = '';
  ALL_DISTRICTS.forEach(d => {
    const opt = document.createElement('option');
    opt.value = d.code;
    opt.textContent = currentPortalLang === 'bn' ? d.name_bn : d.name_en;
    if (d.code === currentVal) opt.selected = true;
    distSelect.appendChild(opt);
  });
}

function setWidgetMode(mode) {
  currentWidgetMode = mode;
  const btnKhatian = document.getElementById('btnToggleKhatian');
  const btnPlot = document.getElementById('btnTogglePlot');
  const groupKhatian = document.getElementById('groupKhatianInput');
  const groupPlot = document.getElementById('groupPlotInput');

  if (mode === 'khatian') {
    if (btnKhatian) btnKhatian.classList.add('active');
    if (btnPlot) btnPlot.classList.remove('active');
    if (groupKhatian) groupKhatian.style.display = 'block';
    if (groupPlot) groupPlot.style.display = 'none';
  } else {
    if (btnPlot) btnPlot.classList.add('active');
    if (btnKhatian) btnKhatian.classList.remove('active');
    if (groupKhatian) groupKhatian.style.display = 'none';
    if (groupPlot) groupPlot.style.display = 'block';
  }
}

async function onWidgetDistrictChange(preferredBlock, preferredMouza) {
  const distSelect = document.getElementById('widgetDistrict');
  const blockSelect = document.getElementById('widgetBlock');
  const mouzaSelect = document.getElementById('widgetMouza');
  if (!distSelect || !blockSelect || !mouzaSelect) return;

  const distVal = distSelect.value;
  const prevBlockVal = preferredBlock || blockSelect.value;

  blockSelect.innerHTML = `<option value="">${currentPortalLang === 'bn' ? 'ব্লক লোড হচ্ছে...' : 'Loading Blocks...'}</option>`;
  mouzaSelect.innerHTML = `<option value="">${currentPortalLang === 'bn' ? 'মৌজা লোড হচ্ছে...' : 'Loading Mouzas & J.L....'}</option>`;

  const blocks = await fetchBlocksForDistrict(distVal);
  blockSelect.innerHTML = '';

  if (blocks && blocks.length > 0) {
    let matched = false;
    blocks.forEach((blk, idx) => {
      const opt = document.createElement('option');
      opt.value = blk.bcode;
      const rawText = blk.text || blk.name || '';
      opt.textContent = rawText.startsWith('[') ? rawText : `[ ${blk.bcode} ] ${rawText}`;
      if (prevBlockVal && blk.bcode === prevBlockVal) {
        opt.selected = true;
        matched = true;
      } else if (!matched && idx === 0) {
        opt.selected = true;
      }
      blockSelect.appendChild(opt);
    });
  } else {
    blockSelect.innerHTML = `<option value="">${currentPortalLang === 'bn' ? 'কোনো ব্লক পাওয়া যায়নি' : 'No blocks available'}</option>`;
  }

  await onWidgetBlockChange(preferredMouza);
}

async function onWidgetBlockChange(preferredMouza) {
  const distSelect = document.getElementById('widgetDistrict');
  const blockSelect = document.getElementById('widgetBlock');
  const mouzaSelect = document.getElementById('widgetMouza');
  if (!distSelect || !blockSelect || !mouzaSelect) return;

  const distVal = distSelect.value;
  const blockVal = blockSelect.value;
  if (!distVal || !blockVal) {
    mouzaSelect.innerHTML = `<option value="">${currentPortalLang === 'bn' ? 'মৌজা নির্বাচন করুন' : '--- Select Mouza ---'}</option>`;
    return;
  }

  const prevMouzaVal = preferredMouza || mouzaSelect.value;
  mouzaSelect.innerHTML = `<option value="">${currentPortalLang === 'bn' ? 'মৌজা লোড হচ্ছে...' : 'Loading Mouzas & J.L....'}</option>`;

  const mouzas = await fetchMouzasForBlock(distVal, blockVal);
  mouzaSelect.innerHTML = '';

  if (mouzas && mouzas.length > 0) {
    let matched = false;
    mouzas.forEach((m, idx) => {
      const opt = document.createElement('option');
      opt.value = m.moucode;
      const rawText = m.text || m.name || '';
      opt.textContent = rawText.startsWith('[') ? rawText : `[ ${m.moucode} ] ${rawText}`;
      if (prevMouzaVal && m.moucode === prevMouzaVal) {
        opt.selected = true;
        matched = true;
      } else if (!matched && idx === 0) {
        opt.selected = true;
      }
      mouzaSelect.appendChild(opt);
    });
  } else {
    mouzaSelect.innerHTML = `<option value="">${currentPortalLang === 'bn' ? 'কোনো মৌজা পাওয়া যায়নি' : 'No mouzas available'}</option>`;
  }
}

function handleWidgetSubmit(event) {
  if (event) event.preventDefault();
  const distSelect = document.getElementById('widgetDistrict');
  const blockSelect = document.getElementById('widgetBlock');
  const mouzaSelect = document.getElementById('widgetMouza');

  const dist = distSelect ? distSelect.value : '01';
  const block = blockSelect ? blockSelect.value : '19';
  const mouza = mouzaSelect ? mouzaSelect.value : '089';

  let rawNum = '';
  if (currentWidgetMode === 'khatian') {
    const khatianInput = document.getElementById('widgetKhatianNum');
    rawNum = khatianInput ? khatianInput.value.trim() : '101';
  } else {
    const plotInput = document.getElementById('widgetPlotNum');
    rawNum = plotInput ? plotInput.value.trim() : '205';
  }

  if (!rawNum) {
    rawNum = currentWidgetMode === 'khatian' ? '101' : '205';
  }

  let num = rawNum;
  let part2 = '';
  if (rawNum.includes('/')) {
    const parts = rawNum.split('/');
    num = parts[0].trim();
    part2 = parts[1].trim();
  }

  launchPresetTarget(dist, block, mouza, num, currentWidgetMode, part2);
}

function launchPresetTarget(dist, block, mouza, num, mode, part2) {
  try {
    sessionStorage.setItem('wb_auto_preset', JSON.stringify({ dist, block, mouza, num, mode, part2 }));
  } catch (e) { }
  window.location.href = `/app?autoDist=${encodeURIComponent(dist)}&autoBlock=${encodeURIComponent(block)}&autoMouza=${encodeURIComponent(mouza)}&autoNum=${encodeURIComponent(num)}&autoMode=${encodeURIComponent(mode || 'khatian')}&autoP2=${encodeURIComponent(part2 || '')}`;
}

document.addEventListener('DOMContentLoaded', () => {
  let savedLang = 'en';
  try {
    savedLang = localStorage.getItem('wb_portal_lang') || 'en';
  } catch (e) {
    savedLang = 'en';
  }
  setPortalLanguage(savedLang);

  const distSelect = document.getElementById('widgetDistrict');
  if (distSelect) {
    distSelect.addEventListener('change', () => onWidgetDistrictChange());
  }

  const blockSelect = document.getElementById('widgetBlock');
  if (blockSelect) {
    blockSelect.addEventListener('change', () => onWidgetBlockChange());
  }

  onWidgetDistrictChange('19', '089');

  const btnMobile = document.getElementById('btnMenuMobile');
  const mobilePanel = document.getElementById('mobileNavPanel');

  if (btnMobile && mobilePanel) {
    btnMobile.addEventListener('click', () => {
      mobilePanel.classList.toggle('open');
      btnMobile.classList.toggle('open');
      const isExpanded = mobilePanel.classList.contains('open');
      btnMobile.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
      btnMobile.textContent = isExpanded ? '✕' : (currentPortalLang === 'bn' ? '☰ মেনু' : '☰ Menu');
    });

    const mobileLinks = mobilePanel.querySelectorAll('a');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobilePanel.classList.remove('open');
        btnMobile.classList.remove('open');
        btnMobile.textContent = currentPortalLang === 'bn' ? '☰ মেনু' : '☰ Menu';
      });
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });
});
