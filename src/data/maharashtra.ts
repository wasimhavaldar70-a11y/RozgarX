export interface TalukaCity {
  id: string;
  name: string;
  isCity: boolean;
}

export interface MaharashtraDistrict {
  id: string;
  name: string;
  marathiName: string;
  division: 'Konkan' | 'Pune' | 'Nashik' | 'Chhatrapati Sambhajinagar' | 'Amravati' | 'Nagpur';
  headquarters: string;
  popularCities: string[];
  talukas: string[];
}

export const MAHARASHTRA_DISTRICTS: MaharashtraDistrict[] = [
  {
    id: 'pune',
    name: 'Pune',
    marathiName: 'पुणे',
    division: 'Pune',
    headquarters: 'Pune',
    popularCities: ['Pune City', 'Pimpri-Chinchwad', 'Hinjewadi', 'Chakan', 'Hadapsar', 'Bhosari'],
    talukas: ['Haveli', 'Pune City', 'Maval', 'Mulshi', 'Khed', 'Shirur', 'Baramati', 'Indapur', 'Daund', 'Bhor', 'Velhe', 'Purandar', 'Junnar', 'Ambegaon']
  },
  {
    id: 'mumbai-city',
    name: 'Mumbai City',
    marathiName: 'मुंबई शहर',
    division: 'Konkan',
    headquarters: 'Mumbai',
    popularCities: ['Nariman Point', 'Fort', 'Colaba', 'Dadar', 'Worli', 'Lower Parel'],
    talukas: ['Mumbai City']
  },
  {
    id: 'mumbai-suburban',
    name: 'Mumbai Suburban',
    marathiName: 'मुंबई उपनगर',
    division: 'Konkan',
    headquarters: 'Bandra',
    popularCities: ['Bandra-Kurla Complex', 'Andheri', 'Borivali', 'Goregaon', 'Kurla', 'Ghatkopar', 'Powai'],
    talukas: ['Andheri', 'Borivali', 'Kurla']
  },
  {
    id: 'nagpur',
    name: 'Nagpur',
    marathiName: 'नागपूर',
    division: 'Nagpur',
    headquarters: 'Nagpur',
    popularCities: ['Nagpur City', 'MIHAN', 'Hingna', 'Kamptee', 'Butibori', 'Kalmeshwar'],
    talukas: ['Nagpur Urban', 'Nagpur Rural', 'Kamptee', 'Hingna', 'Katol', 'Narkhed', 'Savner', 'Kalmeshwar', 'Ramtek', 'Parseoni', 'Mouda', 'Umred', 'Kuhi', 'Bhiwapur']
  },
  {
    id: 'thane',
    name: 'Thane',
    marathiName: 'ठाणे',
    division: 'Konkan',
    headquarters: 'Thane',
    popularCities: ['Thane City', 'Kalyan', 'Dombivli', 'Bhiwandi', 'Ulhasnagar', 'Ambernath', 'Badlapur'],
    talukas: ['Thane', 'Kalyan', 'Bhiwandi', 'Ulhasnagar', 'Ambernath', 'Murbad', 'Shahapur']
  },
  {
    id: 'nashik',
    name: 'Nashik',
    marathiName: 'नाशिक',
    division: 'Nashik',
    headquarters: 'Nashik',
    popularCities: ['Nashik City', 'Ambad MIDC', 'Satpur', 'Sinnar', 'Malegaon', 'Deolali'],
    talukas: ['Nashik', 'Igatpuri', 'Dindori', 'Peth', 'Trimbakeshwar', 'Kalwan', 'Deola', 'Surgana', 'Baglan', 'Malegaon', 'Nandgaon', 'Chandwad', 'Niphad', 'Sinnar', 'Yeola']
  },
  {
    id: 'kolhapur',
    name: 'Kolhapur',
    marathiName: 'कोल्हापूर',
    division: 'Pune',
    headquarters: 'Kolhapur',
    popularCities: ['Kolhapur City', 'Shiroli MIDC', 'Gokul Shirgaon', 'Ichalkaranji', 'Jaysingpur', 'Kagal'],
    talukas: ['Karvir', 'Panhala', 'Shahuwadi', 'Kagal', 'Hatkanangle', 'Shirol', 'Radhanagari', 'Gaganbawda', 'Bhudargad', 'Ajara', 'Gadhinglaj', 'Chandgad']
  },
  {
    id: 'chhatrapati-sambhajinagar',
    name: 'Chhatrapati Sambhajinagar (Aurangabad)',
    marathiName: 'छत्रपती संभाजीनगर',
    division: 'Chhatrapati Sambhajinagar',
    headquarters: 'Chhatrapati Sambhajinagar',
    popularCities: ['Waluj MIDC', 'Shendra MIDC', 'Chikalthana', 'Paithan', 'Vaijapur'],
    talukas: ['Aurangabad', 'Kannad', 'Soegaon', 'Sillod', 'Khuldabad', 'Gangapur', 'Vaijapur', 'Paithan', 'Phulambri']
  },
  {
    id: 'solapur',
    name: 'Solapur',
    marathiName: 'सोलापूर',
    division: 'Pune',
    headquarters: 'Solapur',
    popularCities: ['Solapur City', 'Pandharpur', 'Barshi', 'Akkalkot', 'Mohol'],
    talukas: ['Solapur North', 'Solapur South', 'Barshi', 'Akkalkot', 'Mohol', 'Mangalwedha', 'Pandharpur', 'Sangole', 'Malshiras', 'Karmala', 'Madha']
  },
  {
    id: 'satara',
    name: 'Satara',
    marathiName: 'सातारा',
    division: 'Pune',
    headquarters: 'Satara',
    popularCities: ['Satara MIDC', 'Karad', 'Phaltan', 'Wai', 'Mahabaleshwar', 'Shirwal'],
    talukas: ['Satara', 'Karad', 'Wai', 'Mahabaleshwar', 'Phaltan', 'Maan', 'Khatav', 'Koregaon', 'Patan', 'Jaoli', 'Khandala']
  },
  {
    id: 'sangli',
    name: 'Sangli',
    marathiName: 'सांगली',
    division: 'Pune',
    headquarters: 'Sangli',
    popularCities: ['Sangli City', 'Miraj', 'Kupwad MIDC', 'Islampur', 'Tasgaon', 'Vita'],
    talukas: ['Miraj', 'Kavathe-Mahankal', 'Tasgaon', 'Jat', 'Walwa', 'Shirala', 'Khanapur', 'Atpadi', 'Palus', 'Kadegaon']
  },
  {
    id: 'amravati',
    name: 'Amravati',
    marathiName: 'अमरावती',
    division: 'Amravati',
    headquarters: 'Amravati',
    popularCities: ['Amravati City', 'Badnera', 'Achalpur', 'Nandgaon Khandeshwar', 'Warud'],
    talukas: ['Amravati', 'Bhatkuli', 'Nandgaon Khandeshwar', 'Dharni', 'Chikhaldara', 'Achalpur', 'Chandurbazar', 'Morshi', 'Warud', 'Daryapur', 'Anjangaon Surji', 'Chandur Railway', 'Dhamangaon Railway', 'Tiosa']
  },
  {
    id: 'ahmednagar',
    name: 'Ahilyanagar (Ahmednagar)',
    marathiName: 'अहिल्यानगर',
    division: 'Nashik',
    headquarters: 'Ahilyanagar',
    popularCities: ['Ahmednagar MIDC', 'Shirdi', 'Sangamner', 'Shrirampur', 'Kopargaon'],
    talukas: ['Nagar', 'Shevgaon', 'Pathardi', 'Parner', 'Sangamner', 'Kopargaon', 'Akole', 'Shrirampur', 'Nevasa', 'Rahata', 'Rahuri', 'Karjat', 'Jamkhed']
  },
  {
    id: 'akola',
    name: 'Akola',
    marathiName: 'अकोला',
    division: 'Amravati',
    headquarters: 'Akola',
    popularCities: ['Akola MIDC', 'Murtizapur', 'Akot', 'Balapur'],
    talukas: ['Akola', 'Akot', 'Telhara', 'Balapur', 'Patur', 'Murtizapur', 'Barshitakli']
  },
  {
    id: 'beed',
    name: 'Beed',
    marathiName: 'बीड',
    division: 'Chhatrapati Sambhajinagar',
    headquarters: 'Beed',
    popularCities: ['Beed City', 'Parli Vaijnath', 'Georai', 'Majalgaon', 'Ambejogai'],
    talukas: ['Beed', 'Ashti', 'Patoda', 'Shirur-Kasar', 'Georai', 'Majalgaon', 'Wadwani', 'Kaij', 'Dharur', 'Parli', 'Ambejogai']
  },
  {
    id: 'bhandara',
    name: 'Bhandara',
    marathiName: 'भंडारा',
    division: 'Nagpur',
    headquarters: 'Bhandara',
    popularCities: ['Bhandara', 'Tumsar', 'Sakoli', 'Pauni'],
    talukas: ['Bhandara', 'Tumsar', 'Pauni', 'Mohadi', 'Sakoli', 'Lakhani', 'Lakhandur']
  },
  {
    id: 'buldhana',
    name: 'Buldhana',
    marathiName: 'बुलढाणा',
    division: 'Amravati',
    headquarters: 'Buldhana',
    popularCities: ['Buldhana', 'Khamgaon', 'Malkapur', 'Shegaon', 'Chikhli'],
    talukas: ['Buldhana', 'Chikhli', 'Deulgaon Raja', 'Jalgaon Jamod', 'Sangrampur', 'Malkapur', 'Motala', 'Nandura', 'Khamgaon', 'Shegaon', 'Mehkar', 'Sindkhed Raja', 'Lonar']
  },
  {
    id: 'chandrapur',
    name: 'Chandrapur',
    marathiName: 'चंद्रपूर',
    division: 'Nagpur',
    headquarters: 'Chandrapur',
    popularCities: ['Chandrapur MIDC', 'Ballarpur', 'Warora', 'Rajura', 'Bhadravati'],
    talukas: ['Chandrapur', 'Bhadravati', 'Warora', 'Chimur', 'Nagbhir', 'Brahmapuri', 'Sindewahi', 'Mul', 'Saoli', 'Pombhurna', 'Ballarpur', 'Korpana', 'Rajura', 'Gondpipri', 'Jiwati']
  },
  {
    id: 'dhule',
    name: 'Dhule',
    marathiName: 'धुळे',
    division: 'Nashik',
    headquarters: 'Dhule',
    popularCities: ['Dhule MIDC', 'Shirpur', 'Dondaicha', 'Sakri'],
    talukas: ['Dhule', 'Sakri', 'Sindkheda', 'Shirpur']
  },
  {
    id: 'gadchiroli',
    name: 'Gadchiroli',
    marathiName: 'गडचिरोली',
    division: 'Nagpur',
    headquarters: 'Gadchiroli',
    popularCities: ['Gadchiroli', 'Aheri', 'Armori', 'Chamorshi'],
    talukas: ['Gadchiroli', 'Armori', 'Chamorshi', 'Kurkheda', 'Dhanora', 'Korchi', 'Desaiganj', 'Aheri', 'Etapalli', 'Bhamragad', 'Sironcha', 'Mulchera']
  },
  {
    id: 'gondia',
    name: 'Gondia',
    marathiName: 'गोंदिया',
    division: 'Nagpur',
    headquarters: 'Gondia',
    popularCities: ['Gondia City', 'Tirora', 'Goregaon', 'Amgaon'],
    talukas: ['Gondia', 'Tirora', 'Goregaon', 'Arjuni Morgaon', 'Deori', 'Amgaon', 'Salekasa', 'Sadak Arjuni']
  },
  {
    id: 'hingoli',
    name: 'Hingoli',
    marathiName: 'हिंगोली',
    division: 'Chhatrapati Sambhajinagar',
    headquarters: 'Hingoli',
    popularCities: ['Hingoli', 'Basmath', 'Kalamnuri', 'Sengaon'],
    talukas: ['Hingoli', 'Kalamnuri', 'Basmath', 'Aundha Nagnath', 'Sengaon']
  },
  {
    id: 'jalgaon',
    name: 'Jalgaon',
    marathiName: 'जळगाव',
    division: 'Nashik',
    headquarters: 'Jalgaon',
    popularCities: ['Jalgaon MIDC', 'Bhusawal', 'Chalisgaon', 'Amalner', 'Pachora'],
    talukas: ['Jalgaon', 'Jamner', 'Erandol', 'Dharangaon', 'Bhusawal', 'Raver', 'Muktainagar', 'Bodwad', 'Yawal', 'Amalner', 'Parola', 'Chopda', 'Pachora', 'Bhadgaon', 'Chalisgaon']
  },
  {
    id: 'jalna',
    name: 'Jalna',
    marathiName: 'जालना',
    division: 'Chhatrapati Sambhajinagar',
    headquarters: 'Jalna',
    popularCities: ['Jalna Steel MIDC', 'Partur', 'Ambad', 'Bhokardan'],
    talukas: ['Jalna', 'Bhokardan', 'Jafrabad', 'Badnapur', 'Ambad', 'Ghansawangi', 'Partur', 'Mantha']
  },
  {
    id: 'latur',
    name: 'Latur',
    marathiName: 'लातूर',
    division: 'Chhatrapati Sambhajinagar',
    headquarters: 'Latur',
    popularCities: ['Latur MIDC', 'Udgir', 'Ausa', 'Nilanga', 'Ahmedpur'],
    talukas: ['Latur', 'Udgir', 'Ahmedpur', 'Ausa', 'Nilanga', 'Renapur', 'Chakur', 'Deoni', 'Shirur Anantpal', 'Jalkot']
  },
  {
    id: 'nanded',
    name: 'Nanded',
    marathiName: 'नांदेड',
    division: 'Chhatrapati Sambhajinagar',
    headquarters: 'Nanded',
    popularCities: ['Nanded-Waghala', 'Degloor', 'Mukhed', 'Kinwat', 'Loha'],
    talukas: ['Nanded', 'Ardhapur', 'Mudkhed', 'Bhokar', 'Umri', 'Loha', 'Kandhar', 'Kinwat', 'Himayatnagar', 'Hadgaon', 'Mahoor', 'Degloor', 'Mukhed', 'Dharmabad', 'Biloli', 'Naigaon']
  },
  {
    id: 'nandurbar',
    name: 'Nandurbar',
    marathiName: 'नंदुरबार',
    division: 'Nashik',
    headquarters: 'Nandurbar',
    popularCities: ['Nandurbar', 'Shahada', 'Navapur', 'Taloda'],
    talukas: ['Nandurbar', 'Navapur', 'Shahada', 'Taloda', 'Akkalkuwa', 'Akrani']
  },
  {
    id: 'dharashiv',
    name: 'Dharashiv (Osmanabad)',
    marathiName: 'धाराशिव',
    division: 'Chhatrapati Sambhajinagar',
    headquarters: 'Dharashiv',
    popularCities: ['Dharashiv', 'Tuljapur', 'Omerga', 'Kalamb', 'Bhum'],
    talukas: ['Dharashiv', 'Tuljapur', 'Bhum', 'Paranda', 'Kalamb', 'Omerga', 'Lohara', 'Washi']
  },
  {
    id: 'palghar',
    name: 'Palghar',
    marathiName: 'पालघर',
    division: 'Konkan',
    headquarters: 'Palghar',
    popularCities: ['Palghar MIDC', 'Boisar', 'Vasai', 'Virar', 'Dahanu', 'Jawhar'],
    talukas: ['Palghar', 'Vasai', 'Dahanu', 'Talasari', 'Jawhar', 'Mokhada', 'Vada', 'Vikramgad']
  },
  {
    id: 'parbhani',
    name: 'Parbhani',
    marathiName: 'परभणी',
    division: 'Chhatrapati Sambhajinagar',
    headquarters: 'Parbhani',
    popularCities: ['Parbhani City', 'Gangakhed', 'Jintur', 'Sailu', 'Purna'],
    talukas: ['Parbhani', 'Gangakhed', 'Sonpeth', 'Pathri', 'Manwath', 'Palam', 'Selu', 'Jintur', 'Purna']
  },
  {
    id: 'raigad',
    name: 'Raigad',
    marathiName: 'रायगड',
    division: 'Konkan',
    headquarters: 'Alibag',
    popularCities: ['Navi Mumbai (Panvel)', 'Khopoli', 'Alibag', 'Roha', 'Mahad', 'Pen', 'Karjat'],
    talukas: ['Alibag', 'Pen', 'Murud', 'Panvel', 'Uran', 'Karjat', 'Khalapur', 'Mangaon', 'Tala', 'Roha', 'Sudhagad', 'Mahad', 'Poladpur', 'Shrivardhan', 'Mhasla']
  },
  {
    id: 'ratnagiri',
    name: 'Ratnagiri',
    marathiName: 'रत्नागिरी',
    division: 'Konkan',
    headquarters: 'Ratnagiri',
    popularCities: ['Ratnagiri MIDC', 'Chiplun', 'Khed', 'Guhagar', 'Rajapur'],
    talukas: ['Ratnagiri', 'Chiplun', 'Khed', 'Guhagar', 'Dapoli', 'Mandangad', 'Sangameshwar', 'Lanja', 'Rajapur']
  },
  {
    id: 'sindhudurg',
    name: 'Sindhudurg',
    marathiName: 'सिंधुदुर्ग',
    division: 'Konkan',
    headquarters: 'Oros',
    popularCities: ['Kankavli', 'Sawantwadi', 'Malvan', 'Kudal', 'Vengurla'],
    talukas: ['Kankavli', 'Vaibhavwadi', 'Devgad', 'Malvan', 'Sawantwadi', 'Kudal', 'Vengurla', 'Dodamarg']
  },
  {
    id: 'wardha',
    name: 'Wardha',
    marathiName: 'वर्धा',
    division: 'Nagpur',
    headquarters: 'Wardha',
    popularCities: ['Wardha', 'Hinganghat', 'Arvi', 'Deoli'],
    talukas: ['Wardha', 'Deoli', 'Seloo', 'Arvi', 'Ashti', 'Karanja', 'Hinganghat', 'Samudrapur']
  },
  {
    id: 'washim',
    name: 'Washim',
    marathiName: 'वाशिम',
    division: 'Amravati',
    headquarters: 'Washim',
    popularCities: ['Washim', 'Karanja Lad', 'Risod', 'Mangrulpir'],
    talukas: ['Washim', 'Malegaon', 'Risod', 'Mangrulpir', 'Karanja', 'Manora']
  },
  {
    id: 'yavatmal',
    name: 'Yavatmal',
    marathiName: 'यवतमाळ',
    division: 'Amravati',
    headquarters: 'Yavatmal',
    popularCities: ['Yavatmal', 'Pusad', 'Umarkhed', 'Wani', 'Digras'],
    talukas: ['Yavatmal', 'Arni', 'Babhulgaon', 'Kalamb', 'Darwha', 'Digras', 'Ner', 'Pusad', 'Umarkhed', 'Mahagaon', 'Kelapur', 'Ralegaon', 'Ghatanji', 'Wani', 'Maregaon', 'Zari Jamani']
  }
];

export const MAHARASHTRA_DIVISIONS = [
  'Pune',
  'Konkan',
  'Nashik',
  'Chhatrapati Sambhajinagar',
  'Amravati',
  'Nagpur'
] as const;
