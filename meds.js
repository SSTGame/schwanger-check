/* Verzeichnis der Wirkstoffseiten von Embryotox (Charité Berlin) zum Verlinken.
   Je Zeile: Seiten-Kennung | Wirkstoff und Handelsnamen, wie Embryotox sie führt.
   Die Bewertung selbst steht nur bei Embryotox – die App bewertet keine Medikamente. */
(function (root) {
  "use strict";
  var RAW = "acetazolamid|Acemit|Acetazolamid|Glaupax\n" +
"acetylcystein|ACC|Acetylcystein|Bromuc|Fluimucil|NAC\n" +
"acetyldigoxin|Acetyldigoxin|Novodigal\n" +
"acetylsalicylsaeure|Acetylsalicylsäure|Aspirin|ASS\n" +
"aciclovir|Aciclovir|Acic|Dynexan|Xorox|Zovirax\n" +
"adalimumab|Adalimumab|Amgevita|Hulio|Humira|Hyrimoz|Imraldi\n" +
"adapalen|Adapalen|Differin\n" +
"adenosin|Adenosin|Adrekar\n" +
"albendazol|Albendazol|Eskazole\n" +
"alfentanil|Alfentanil|Rapifen\n" +
"almotriptan|Almogran|Almotriptan\n" +
"aloe|Aloe|Kräuterlax\n" +
"alpha-methyldopa|alpha-Methyldopa|Dopegyt|Presinol\n" +
"alprazolam|Alprazolam|Tafil\n" +
"ambroxol|Ambroxol|Mucoangin|Mucosolvan|Paediamuc\n" +
"amiodaron|Amiodaron|Cordarex\n" +
"amisulprid|Amisulprid|Solian\n" +
"amitriptylin|Amitriptylin\n" +
"amlodipin|Amlodipin|Norvasc\n" +
"amoxicillin|Amoxicillin|Infectomox\n" +
"amoxicillin-und-clavulansaeure|Amoxicillin und Clavulansäure|Augmentan|Clavulansäure\n" +
"amphotericin-b|AmBisome|Ampho-Moronal|Amphotericin B\n" +
"ampicillin|Ampicillin\n" +
"ampicillin-und-sulbactam|Ampicillin und Sulbactam|Unacid\n" +
"antazida|Antazida|Gaviscon|Rennie|Riopan|Talcid|Talidat\n" +
"argatroban|Argatra|Argatroban\n" +
"aripiprazol|ABILIFY|Aripiprazol\n" +
"articain|Articain|Ubistesin|Ultracain\n" +
"atenolol|Atenolol|Tenormin\n" +
"atomoxetin|Agakalin|Atomoxetin|Strattera\n" +
"atorvastatin|Atorvastatin|Sortis\n" +
"atovaquon-und-proguanil|Atovaquon und Proguanil|Malarex|Malarone\n" +
"atropin|Atropin|Atropin-POS Augentropfen|Atropinsulfat Injektionslösung\n" +
"azathioprin|Azafalk|Azathioprin|Imurek|Jayempi\n" +
"azelastin|Allergodil|Azedil|Azelastin|Pollival\n" +
"azilsartan|Azilsartan|Edarbi\n" +
"azithromycin|Azithromycin|Infectoazit|Ultreon|Zithromax\n" +
"baclofen|Baclofen|Lioresal\n" +
"baldrian|Baldrian|Baldriparan|Baldrivit|Sedonium|Valeriana officinalis\n" +
"beclometason|Beclometason|Beclorhinol aquosum|Junik|Rhinivict nasal|Sanasthmax|Ventolair\n" +
"benazepril|Benazepril|Cibacen\n" +
"benperidol|Benperidol|Glianimon\n" +
"benserazid|Benserazid\n" +
"benzylbenzoat|Antiscabiosum|Benzylbenzoat\n" +
"betamethason|Betamethason|Betnesol|Celestamine|Celestan|Diprosone\n" +
"bisacodyl|Bisacodyl|Dulcolax\n" +
"bisoprolol|Bisoprolol|Concor\n" +
"brinzolamid|Azopt|Brinzolamid\n" +
"bromazepam|Bromazanil|Bromazepam|Gityl|Lexostad|Normoc\n" +
"bromhexin|Bisolvon|Bromhexin\n" +
"bromocriptin|Bromocriptin|Parlodel|Pravidel\n" +
"budesonid|Aquacort|Budesonid|Entocort Kapseln und rektal|Novopulmon|Pulmicort\n" +
"bupivacain|Bucain|Bupivacain|Carbostesin|Dolanaest\n" +
"buprenorphin|Buprenorphin|Norspan|Subutex|Temgesic|Transtec\n" +
"bupropion|Bupropion|Elontril|Wellbutrin|Zyban\n" +
"buspiron|Buspiron|Busp\n" +
"butylscopolamin|Buscopan|Butylscopolamin\n" +
"cabergolin|Cabaseril|Cabergolin|Dostinex\n" +
"candesartan|Atacand|Blopress|Candesartan\n" +
"captopril|Captopril\n" +
"carbamazepin|Carbamazepin|Finlepsin|Tegretal|Timonil\n" +
"carbidopa|Carbidopa\n" +
"carbimazol|Carbimazol\n" +
"carvedilol|Carvedilol|Dilatrend|Querto\n" +
"cefaclor|Cefaclor|Infectocef|Panoral\n" +
"cefadroxil|Cefadroxil|Grüncef\n" +
"cefalexin|Cefalexin\n" +
"cefixim|Cefixim|Infectoopticef\n" +
"cefpodoxim|Cefpodoxim\n" +
"ceftriaxon|Ceftriaxon\n" +
"cefuroxim|Cefuroxim\n" +
"celecoxib|Celebrex|Celecoxib\n" +
"certolizumab-pegol|Certolizumab pegol|Cimzia\n" +
"certoparin|Certoparin|Mono-Embolex\n" +
"cetirizin|Cetirizin|Reactine|Zyrtec\n" +
"chloramphenicol|Chloramphenicol|Posifenicol\n" +
"chloroquin|Chloroquin|Resochin\n" +
"chlorphenoxamin|Chlorphenoxamin\n" +
"chlorprothixen|Chlorprothixen\n" +
"ciclosporin|Ciclosporin|Cyclosporin A|Ikervis (Augentropfen)|Sandimmun\n" +
"cimetidin|Cimetidin\n" +
"ciprofloxacin|Ciloxan|Ciprobay|Ciprofloxacin\n" +
"citalopram|Cipramil|Citalo-Q|Citalon|Citalopram|Futuril|Serital\n" +
"clarithromycin|Clarithromycin|Klacid\n" +
"clemastin|Clemastin|Tavegil\n" +
"clenbuterol|Clenbuterol|Spiropent\n" +
"clindamycin|Clindamycin|Sobelin|Zindaclin\n" +
"clobazam|Clobazam|Frisium\n" +
"clomipramin|Anafranil|Clomipramin\n" +
"clonazepam|Antelepsin|Clonazepam|Rivotril\n" +
"clonidin|Catapresan|Clonidin|Isoglaucon\n" +
"clopidogrel|Clopidogrel|Iscover|Plavix\n" +
"clostridium-botulinum-toxin|Botox|Botulinumtoxin|Botulismustoxin|Clostridium botulinum Toxin|Dysport|Xeomin\n" +
"clotrimazol|Canifug|Cloderm|Clotrimazol|KadeFungin|Mykofungin 3\n" +
"clozapin|Clozapin|Elcrit|Leponex\n" +
"co-trimoxazol|Co-trimoxazol|Cotrim|Trimethoprim\n" +
"codein|Bronchicum mono|Codein|Codicaps mono\n" +
"colchicin|Colchicin\n" +
"colestyramin|Colestyramin|Lipocol-Merz|Quantalan|Vasosan\n" +
"cromoglicinsaeure|Allergoval Kaps|Cromoglicinsäure|DNCG iso|Pentatop\n" +
"crotamiton|Crotamitex|Crotamiton\n" +
"cyclophosphamid|Cyclophosphamid|Endoxan\n" +
"dalteparin|Dalteparin|Fragmin\n" +
"danaparoid|Danaparoid|Orgaran\n" +
"desloratadin|Aerius|Desloratadin\n" +
"dexamethason|Dexamethason|Fortecortin|Ozurdex|Solupen sine\n" +
"dextromethorphan|Dextromethorphan|DMP|Silomat DMP|Wick Husten-Pastillen\n" +
"diazepam|Diazepam|Faustan|Valium\n" +
"diclofenac|Diclac|Diclofenac|Effekton|Voltaren ophta|Voltaren\n" +
"digitoxin|Digimerck|Digitoxin\n" +
"digoxin|Digoxin|Lanicor\n" +
"dihydralazin|Dihydralazin|Nepresol\n" +
"diltiazem|Diltiazem|Dilzem\n" +
"dimenhydrinat|Dimenhydrinat|Vomex A\n" +
"dimeticon|Dimeticon|Jacutin Pedicul Fluid|NYDA|Sab simplex Kautabletten|Symadal M Spray\n" +
"dimetinden|Dimetinden|Fenistil|Histakut\n" +
"diphenhydramin|Betadorm-D|Diphenhydramin|Dolestan|Dorm|Emesan|Halbmond|Vivinox Sleep\n" +
"distigmin|Distigmin|Ubretid\n" +
"domperidon|Domperidon|Motilium\n" +
"dorzolamid|Dorzolamid|Trusopt\n" +
"doxepin|Aponal|Doxepin|Mareen\n" +
"doxycyclin|Doxycyclin\n" +
"doxylamin|Cariban|Doxylamin|Hoggar Night|Schlafsterne|Xonvea\n" +
"duloxetin|Cymbalta|Duloxalta|Duloxetin|Yentreve\n" +
"ebastin|Ebastel|Ebastin\n" +
"echinacea|Echinacea|Purpur-Sonnenhut\n" +
"efeu|Efeu|Prospan\n" +
"eletriptan|Eletriptan|Relpax\n" +
"enalapril|Enalapril|XANEF\n" +
"enoxaparin|Clexane|Enoxaparin|Inhixa\n" +
"eprosartan|Eprosartan|TEVETEN MONO\n" +
"eptinezumab|Eptinezumab|Vyepti\n" +
"erenumab|Aimovig|Erenumab\n" +
"ergotamintartrat|ERGO-KRANIT Migräne|Ergotamintartrat\n" +
"erythromycin|Erythromycin|Infectomycin\n" +
"escitalopram|Cipralex|Escitalopram\n" +
"esomeprazol|Esomeprazol|Nexium\n" +
"estrogene|Estrogene\n" +
"eszopiclon|Eszopiclon|Lunivia\n" +
"etanercept|Enbrel|Etanercept\n" +
"etilefrin|Bioflutin|Effortil|Etilefrin|Thomasin\n" +
"etoricoxib|Arcoxia|Etoricoxib\n" +
"famotidin|Famotidin|Pepdul\n" +
"fenoterol|Berotec N|Fenoterol|Partusisten\n" +
"fentanyl|Durogesic|Fentanyl|Instanyl\n" +
"fexofenadin|Fexofenadin|Telfast\n" +
"flecainid|Flecainid|Tambocor\n" +
"flucloxacillin|Flucloxacillin|Staphylex\n" +
"fluconazol|Diflucan|Fluconazol|Fungata\n" +
"flunarizin|Flunarizin|Flunavert|Natil-N\n" +
"flunisolid|Flunisolid|Syntaris\n" +
"flunitrazepam|Fluninoc|Flunitrazepam|Rohypnol\n" +
"fluoxetin|Fluoxetin\n" +
"flupentixol|Fluanxol|Flupentixol\n" +
"fluphenazin|Fluphenazin\n" +
"fluspirilen|Fluspirilen|Imap\n" +
"fluticason|Avamys|Fluticason|Flutide|Flutivate Creme\n" +
"fluvastatin|Fluvastatin|LOCOL\n" +
"fluvoxamin|Fevarin|Fluvoxamin\n" +
"fondaparinux|Arixtra|Fondaparinux\n" +
"formoterol|Foradil P|Formatris|Formoterol\n" +
"fosfomycin|Fosfomycin|Infectofos|Monuril\n" +
"fosinopril|Fosinopril\n" +
"fremanezumab|Ajovy|Fremanezumab\n" +
"frovatriptan|Allegro|Frovatriptan\n" +
"fumarsaeureester|Dimethylfumarat|Diroximelfumarat|Ethylhydrogenfumarat|Fumaderm|Fumarsäureester|Skilarence|Tecfidera|Vumerity\n" +
"furosemid|Furosemid|Lasix\n" +
"galcanezumab|Emgality|Galcanezumab\n" +
"ganciclovir|Cymeven|Ganciclovir|Virgan\n" +
"gentamicin|Gent-Ophtal|Gentamicin|Gentamycin|Refobacin\n" +
"gestagene|Cerazette|Depo-Clinovir|Desogestrel|Etonogestrel|Gestagene|Implanon|Jaydess|Levonorgestrel|Medroxyprogesteronacetat|Mirena|PiDaNa\n" +
"ginkgo|Gingium|Ginkgo|Kaveri|Rökan|Tebonin\n" +
"glatiramer|Clift|Copaxone|Glatiramer\n" +
"glibenclamid|Euglucon|Glibenclamid\n" +
"glyceroltrinitrat|Glyceroltrinitrat|Nitroderm TTS|Nitrolingual|Rectogesic\n" +
"haloperidol|Haldol|Haloperidol\n" +
"heparin|Heparin\n" +
"hydrochlorothiazid|HCT|Hydrochlorothiazid\n" +
"hydromorphon|Hydromorphon|Jurnista|Palladon\n" +
"hydrotalcit|Hydrotalcit\n" +
"hydroxychloroquin|Hydroxychloroquin|Quensyl\n" +
"hyposensibilisierung|ACARIZAX|ALK|Allergen-Immuntherapie (AIT)|Allergovit|Depigoid|Desensibilisierung|Hyposensibilisierung|Purethal|Spezifische Immuntherapie (SIT)|Venomil\n" +
"ibuprofen|Aktren|Dismenol N|Ibuprofen|Imbun|Nurofen\n" +
"imipramin|Imipramin\n" +
"impfstoffe|Impfstoffe\n" +
"indometacin|Indometacin\n" +
"infliximab|Infliximab|Remicade\n" +
"ingwer|Ingwer|Zintona\n" +
"insulin-aspart|Fiasp|Insulin aspart|NovoRapid\n" +
"insulin-degludec|Insulin degludec|Tresiba\n" +
"insulin-detemir|Insulin detemir|Levemir\n" +
"insulin-glargin|Abasaglar|Insulin glargin|Lantus|Toujeo\n" +
"insulin-glulisin|Apidra|Insulin glulisin\n" +
"insulin-human|Actrapid|Berlinsulin H|Insulin human|Protaphane\n" +
"insulin-lispro|Humalog|Insulin lispro|Liprolog|Lyumjev\n" +
"interferon-beta-1a|AVONEX|Interferon beta-1a|Rebif\n" +
"interferon-beta-1b|Betaferon|Extavia|Interferon beta-1b\n" +
"ipratropiumbromid|Atrovent|Ipratropiumbromid|Nasipral\n" +
"irbesartan|Aprovel|Irbesartan|Karvea\n" +
"isotretinoin|Aknenormin|Isoderm|Isotretinoin|Isotret|ISOTREX\n" +
"itraconazol|Itraconazol|Itraisdin|Sempera\n" +
"johanniskraut|Hyperforat|Hypericin|Jarsin|Johanniskraut|Laif|Neuroplant\n" +
"ketoconazol|Ketoconazol|Ketozolin|Nizoral|Terzolin\n" +
"ketoprofen|Alrheumun|Gabrilen|Ketoprofen\n" +
"ketotifen|Ketotifen|Zaditen\n" +
"kontrazeptiva-orale|aida|Chlormadinon|Cilest|Dienogest|Drospirenon|Ethinylestradiol|Femigoa|Femovan|Kontrazeptiva, orale|Lovelle|Minisiston|MonoStep|Petibelle|Valette|Yasmin\n" +
"lactulose|Bifiteral|Lactuflor|Lactulose\n" +
"lamotrigin|Lamictal|Lamotrigin\n" +
"lansoprazol|Agopton|Lansoprazol\n" +
"latanoprost|Latanoprost|Xalatan\n" +
"leflunomid|Arava|Leflon|Leflunomid\n" +
"levetiracetam|Keppra|Levetiracetam\n" +
"levocabastin|Levocabastin|Livocabdirekt\n" +
"levocetirizin|Levocetirizin|Xusal\n" +
"levodopa|Levodopa\n" +
"levofloxacin|Levofloxacin|Oftaquix|Tavanic\n" +
"levomepromazin|Levomepromazin|Neurocil\n" +
"levomethadon|L-Polamidon|Levomethadon\n" +
"lidocain|Dynexan Mundgel|Heweneural|Lidocain|Lidoject|Posterisan akut|Xylocain|Xyloneural\n" +
"lisdexamfetamin|Elvanse adult|Lisdexamfetamin\n" +
"lisinopril|Lisinopril\n" +
"lithiumsalze|Hypnorex|Lithiumsalze|Quilonum\n" +
"loperamid|Imodium|Lopedium|Loperamid\n" +
"loratadin|Lorano|Loratadin\n" +
"lorazepam|Lorazepam|Tavor|Tolid\n" +
"lormetazepam|Ergocalm|Loretam|Lormetazepam|Noctamid|Sedalam\n" +
"losartan|LORZAAR|Losartan\n" +
"lovastatin|Lovastatin\n" +
"macrogol|Laxabene|Laxofalk|Macrogol\n" +
"magaldrat|Magaldrat\n" +
"maprotilin|Maprotilin\n" +
"mebendazol|Mebendazol|Vermox\n" +
"meclozin|Agyrax|Meclozin|Postadoxin N\n" +
"mefloquin|Lariam|Mefloquin\n" +
"melperon|Melneurin|Melperon\n" +
"mepivacain|Meaverin|Mecain|Mepivacain|Mepivastesin|Scandicain\n" +
"mercaptopurin|Mercaptopurin|Puri-Nethol|Xaluprine\n" +
"mesalazin|5-Aminosalicylsäure|5-ASA|Claversal|Mesalazin|Pentasa|Salofalk\n" +
"metamizol|Analgin|Berlosin|Metamizol|Novalgin|Novaminsulfon\n" +
"metformin|Glucophage|Juformin|Metformin|Siofor\n" +
"methadon|Methadon\n" +
"methotrexat|Lantarel|Methotrexat|MTX\n" +
"methylphenidat|Concerta|Kinecteen|Medikinet adult|Methylphenidat|Ritalin Adult\n" +
"methylprednisolon|Advantan|Methylprednisolon|Urbason\n" +
"metildigoxin|Lanitop|Metildigoxin\n" +
"metoclopramid|MCP|Metoclopramid|Paspertin\n" +
"metoprolol|Beloc|Metoprolol\n" +
"metronidazol|Arilin|Metronidazol\n" +
"mianserin|Mianserin\n" +
"miconazol|Daktar|Gyno-Mykotral|Miconazol\n" +
"midazolam|Buccolam|Dormicum|Midazolam\n" +
"minocyclin|Minocyclin|Skid\n" +
"mirtazapin|Mirtazapin\n" +
"misoprostol|Angusta|Arthotec|Cytotec|Misoprostol\n" +
"mizolastin|Mizolastin|Mizollen|Zolim\n" +
"moclobemid|Aurorix|Moclobemid\n" +
"mometason|Asmanex Twisthaler|Ecural|Mometason|Nasonex Nasenspray\n" +
"montelukast|Monkasta|Montelukast|Singulair\n" +
"moosbeere|Cranberry|Kranbeere|Moosbeere\n" +
"morphin|Capros|Morphin|MSI|MSR|MST|Oramorph|Sevredol|Substitol\n" +
"moxifloxacin|Avalox|Moxifloxacin|Vigamox\n" +
"moxonidin|Cynt|Moxonidin|Physiotens\n" +
"mupirocin|Bactroban|Infectopyoderm|Mupirocin|Turixin\n" +
"mycophenolat|CellCept|Mycophenolat|Myfenax|Myfortic\n" +
"nadroparin|Fraxiparine|Fraxodi|Nadroparin\n" +
"naproxen|Aleve|Dolormin für Frauen|Naproxen\n" +
"naratriptan|Formigran|Naramig|Naratriptan\n" +
"natriumpicosulfat|Dulcolax NP|Laxoberal|Natriumpicosulfat\n" +
"neostigmin|Neostigmin|NEOSTIG\n" +
"niclosamid|Niclosamid|Yomesan\n" +
"nifedipin|Nifedipin\n" +
"nimodipin|Nimodipin|Nimotop\n" +
"nitrendipin|Bayotensin|Nitrendipin\n" +
"nitrofurantoin|Furadantin|Nifurantin|Nitrofurantoin\n" +
"norfloxacin|BARAZAN|Norfloxacin\n" +
"nortriptylin|Nortriptylin\n" +
"noscapin|Capval|Noscapin\n" +
"nystatin|Adiclair|Biofanal|Lederlind|Moronal|Nystatin\n" +
"ofloxacin|Floxal|Ofloxacin\n" +
"olanzapin|Olanzapin|ZYPREXA\n" +
"olmesartan|Olmesartan|Votum\n" +
"omalizumab|Omalizumab|Omlyclo|Xolair\n" +
"omeprazol|Antra MUPS|Omeprazol|OMEP\n" +
"ondansetron|Ondansetron|Zofran\n" +
"opipramol|Insidon|Opipramol\n" +
"oxybutynin|Dridase|Kentera|Oxybutynin|Spasyt\n" +
"oxycodon|Oxycodon|Oxycontin|Oxygesic\n" +
"oxymetazolin|Nasivin|Oxymetazolin|WICK Sinex\n" +
"paliperidon|Invega|Paliperidon|Trevicta|Xeplion\n" +
"pantoprazol|Pantoprazol|rifun\n" +
"paracetamol|Acetaminophen|Paracetamol\n" +
"paroxetin|Paroxetin|Seroxat\n" +
"penicillin-g|Benzylpenicillin|Penicillin G\n" +
"penicillin-v|Penicillin V|Phenoxymethylpenicillin\n" +
"perazin|Perazin\n" +
"perindopril|Perindopril\n" +
"permethrin|Infectopedicul|Infectoscab|Permethrin\n" +
"perphenazin|Perphenazin\n" +
"pethidin|Dolantin|Dolcontral|Pethidin\n" +
"phenprocoumon|Falithrom|Marcumar|Phenprocoumon\n" +
"phenylbutazon|Ambene|Phenylbutazon\n" +
"pimozid|Orap|Pimozid\n" +
"pipamperon|Dipiperon|Pipamperon\n" +
"piritramid|Dipidolor|Piritramid\n" +
"piroxicam|Piroxicam\n" +
"pivmecillinam|Pivmecillinam|Pivmelam|X-Systo\n" +
"povidon-iod|Betaisodona|Braunol|Braunovidon|Freka-Cid|Polysept|Povidon-Iod|Povidon-Jod\n" +
"pravastatin|Pravachol|Pravastatin\n" +
"prednisolon|Decortin H|Dontisolon D|Inflanefran forte|Prednisolon|Solu-Decortin H\n" +
"prednison|Decortin|Lodotra|Prednison|Rectodelt\n" +
"pregabalin|LYRICA|Pregabalin\n" +
"prilocain|Prilocain|Xylonest\n" +
"progesteron|Crinone|Famenita|Progesteron|Utrogest\n" +
"promethazin|Atosil|Promethazin\n" +
"propafenon|Propafenon|Rytmonorm\n" +
"propofol|Disoprivan|Propofol\n" +
"propranolol|Dociton|Obsidan|Propranolol\n" +
"propylthiouracil|Propycil|Propylthiouracil|PTU\n" +
"pyrantel|Helmex|Pyrantel\n" +
"pyrethrumextrakt|Goldgeist forte|Pyrethrumextrakt\n" +
"pyridostigmin|Kalymin|Mestinon|Pyridostigmin\n" +
"pyridoxin|Pyridoxin|Vitamin B6\n" +
"pyrvinium|Molevac|Pyrvinium|Pyrviniumembonat|Pyrviniumhemiembonat\n" +
"quetiapin|Quetiapin|Seroquel\n" +
"quinapril|Accupro|Quinapril\n" +
"ramipril|Delix|Ramipril\n" +
"remifentanil|Remifentanil|Ultiva\n" +
"reproterol|Bronchospasmin|Reproterol\n" +
"rifampicin|Eremfat|Rifampicin\n" +
"risperidon|RISPERDAL|Risperidon\n" +
"rituximab|MabThera|Rituximab\n" +
"rizatriptan|Maxalt|Rizatriptan\n" +
"rizinusoel|Rizinusöl\n" +
"ropivacain|Naropin|Ropivacain\n" +
"rosuvastatin|Crestor|Rosuvastatin\n" +
"roxithromycin|Roxithromycin\n" +
"rupatadin|Rupafin|Rupatadin|Urtimed\n" +
"salbutamol|Albuterol|Salbutamol|Sultanol\n" +
"salmeterol|Salmeterol|Serevent\n" +
"scopolamin|Boro-Scopol N|Scopoderm TTS|Scopolamin\n" +
"sennesblaetter|Alasenn|Bekunis Instant Tee|Midro|Neda Früchtewürfel|Ramend Abführ-Tabletten|Senna|Sennesblätter\n" +
"sertralin|Sertralin|Zoloft\n" +
"simeticon|Elugan|Espumisan|Lefax|Simeticon\n" +
"simvastatin|Simvastatin|ZOCOR\n" +
"sotalol|Sotalol\n" +
"spironolacton|Aldactone|Spironolacton\n" +
"sucralfat|Sucrabest|Sucralfat\n" +
"sufentanil|Sufentanil|Sufenta|Zalviso\n" +
"sulbactam|Sulbactam\n" +
"sulfasalazin|Azulfidine|Colo-Pleon|Pleon RA|Sulfasalazin\n" +
"sultamicillin|Sultamicillin|Unacid PD oral\n" +
"sumatriptan|Imigran|Sumatriptan\n" +
"tacrolimus|Advagraf|Prograf|Protopic|Tacrolimus\n" +
"telmisartan|Micardis|Telmisartan\n" +
"terbinafin|Dermatin|Lamisil|Terbinafin\n" +
"terbutalin|Aerodur|Bricanyl|Terbutalin\n" +
"theophyllin|Bronchoretard|Theophyllin\n" +
"thiamazol|Methimazol|Methizol|Thiamazol|Thyrozol\n" +
"thiopental|Thiopental|Trapanal\n" +
"thioridazin|Melleril|Thioridazin\n" +
"thymian|Biotuss|Hustagil|Nimopect|Thymian|Thymipin N\n" +
"thyroxin|Berlthyrox|L-Thyroxin|Levothyroxin|Thyroxin\n" +
"tilidin-und-naloxon|Tilidin und Naloxon|Valoron N\n" +
"timolol|Arutimol|Dispatim|Timolol\n" +
"tinzaparin|Innohep|Tinzaparin\n" +
"tiotropiumbromid|Spiriva Respimat|Tiotropiumbromid\n" +
"tolperison|Mydocalm|Tolperison|Viveo\n" +
"topiramat|TOPAMAX|Topiramat\n" +
"tramadol|Tramadol|Tramal\n" +
"tranylcypromin|Jatrosom|Tranylcypromin\n" +
"tretinoin|Airol|Cordes VAS Creme|Tretinoin|Vesanoid\n" +
"triamcinolon|Delphicort|Lederlon|Nasacort|Triamcinolon|Volon A|Volon\n" +
"trimipramin|Stangyl|Trimipramin\n" +
"urapidil|Ebrantil|Urapidil\n" +
"ursodesoxycholsaeure|Ursodesoxycholsäure|Ursofalk|Ursonorm\n" +
"valaciclovir|Valaciclovir|Valtrex\n" +
"valganciclovir|Valcyte|Valganaxiro|Valganciclovir\n" +
"valproinsaeure|Convulex|Ergenyl|Orfiril|Valproinsäure\n" +
"valsartan|Diovan|Provas|Valsartan\n" +
"vancomycin|Vancomycin\n" +
"vedolizumab|Entyvio|Vedolizumab\n" +
"venlafaxin|Trevilor retard|Venlafaxin\n" +
"verapamil|Isoptin|Verapamil\n" +
"vilanterol|Vilanterol\n" +
"xylometazolin|Olynth|Otriven|Xylometazolin\n" +
"ziprasidon|ZELDOX|Ziprasidon\n" +
"zolmitriptan|Ascotop|Zolmitriptan\n" +
"zolpidem|Bikalm|Stilnox|Zolpi-Lich|Zolpidem|Zolpinox\n" +
"zopiclon|Ximovan|Zopiclon\n" +
"zuclopenthixol|Ciatyl-Z|Zuclopenthixol";

  // Häufige Handelsnamen, die Embryotox nicht als eigenen Eintrag führt → Wirkstoffseite
  var EXTRA = {
    "ben-u-ron": "paracetamol", "Benuron": "paracetamol", "Paracetamol-ratiopharm": "paracetamol",
    "Ibuflam": "ibuprofen", "Dolormin": "ibuprofen", "Ibu": "ibuprofen", "Ibuprofen-ratiopharm": "ibuprofen",
    "Vomex": "dimenhydrinat", "Pantozol": "pantoprazol", "Nasic": "xylometazolin",
    "Novaminsulfon-ratiopharm": "metamizol", "Thomapyrin": "acetylsalicylsaeure", "Aspirin Complex": "acetylsalicylsaeure",
    "Sab simplex": "dimeticon", "Iberogast": null, "Magnesium": null, "Folsäure": null, "Eisen": null, "Jod": null
  };

  function norm(s) {
    return String(s || "").toLowerCase().replace(/®|™/g, "")
      .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
      .normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
  }

  var ENTRIES = [];   // {name, slug, ingredient, n}
  var BY_SLUG = {};
  RAW.split("\n").forEach(function (line) {
    var parts = line.split("|"), slug = parts.shift();
    // Wirkstoffname = Eintrag, dessen Kennung zum Slug passt, sonst der erste
    var ing = parts.filter(function (p) { return norm(p).replace(/ /g, "-") === slug || norm(p).replace(/ /g, "") === slug.replace(/-/g, ""); })[0] || parts[0];
    BY_SLUG[slug] = ing;
    parts.forEach(function (p) { ENTRIES.push({ name: p, slug: slug, ingredient: ing, n: norm(p) }); });
  });
  Object.keys(EXTRA).forEach(function (k) {
    var slug = EXTRA[k];
    ENTRIES.push({ name: k, slug: slug, ingredient: slug ? BY_SLUG[slug] : null, n: norm(k), extra: true });
  });

  var BASE = "https://www.embryotox.de/arzneimittel/details/ansicht/medikament/";
  function url(slug) { return slug ? BASE + encodeURIComponent(slug) + "/" : "https://www.embryotox.de/arzneimittel"; }

  // Suche: exakte Treffer, dann Wortanfänge, dann enthält
  function search(q, limit) {
    var nq = norm(q);
    if (!nq) return [];
    var scored = [];
    ENTRIES.forEach(function (e) {
      var s = -1;
      if (e.n === nq) s = 0;
      else if (e.n.indexOf(nq) === 0) s = 1;
      else if ((" " + e.n).indexOf(" " + nq) !== -1) s = 2;
      else if (nq.length >= 3 && e.n.indexOf(nq) !== -1) s = 3;
      if (s >= 0) scored.push([s, e]);
    });
    scored.sort(function (a, b) { return a[0] - b[0] || (a[1].name === a[1].ingredient ? -1 : 0) - (b[1].name === b[1].ingredient ? -1 : 0) || a[1].name.localeCompare(b[1].name, "de"); });
    var seen = {}, out = [];
    scored.forEach(function (x) {
      var e = x[1], key = (e.slug || "none") + "|" + e.name.toLowerCase();
      if (seen[key]) return; seen[key] = 1; out.push(e);
    });
    return out.slice(0, limit || 8);
  }

  var api = { search: search, url: url, ingredient: function (slug) { return BY_SLUG[slug]; }, count: Object.keys(BY_SLUG).length, PHONE: "+49 30 450 525 700", HOURS: "Mo–Fr 9–12 Uhr", CONSULT: "https://www.embryotox.de/beratung" };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.SCMeds = api;
})(this);
