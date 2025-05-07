import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Twitter, Github, Coffee, Check } from 'lucide-react';
// Profil fotoğrafını import edin
import profilePhoto from '../ProfilePhoto.jpeg';

const AboutPage: React.FC = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-secondary py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">Hakkımızda</h1>
            <p className="text-lg text-foreground/80">
              Viski dünyasına olan tutkumuz ve bu platformu oluşturma hikayemiz
            </p>
          </motion.div>
        </div>
      </section>
      
      {/* Main Content */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-card rounded-lg shadow-md p-8">
              <div className="flex flex-col md:flex-row md:items-center gap-8 mb-10">
                <div className="md:w-1/3">
                  <div className="aspect-square rounded-full overflow-hidden bg-secondary flex items-center justify-center">
                    {/* Profil fotoğrafını kullanın */}
                    <img src={profilePhoto} alt="İmge ve Rüştü" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="md:w-2/3">
                  <h2 className="font-serif text-2xl font-bold mb-4">Viski Tutkunları, İmge ve Rüştü</h2>
                  <p className="text-foreground/80 mb-4">
                    Biz sadece viski içmiyoruz, her şişenin arkasındaki hikayeyi, kültürü ve zanaatı keşfediyoruz.
                  </p>
                  <div className="flex space-x-4">
                    <a 
                      href="mailto:info@viskibolt.com" 
                      className="text-primary hover:underline flex items-center"
                    >
                      <Mail size={16} className="mr-1" />
                      Email
                    </a>
                    <a 
                      href="https://twitter.com/viskibolt" 
                      className="text-primary hover:underline flex items-center"
                    >
                      <Twitter size={16} className="mr-1" />
                      Twitter
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="space-y-8">
                <div>
                  <h3 className="font-serif text-xl font-semibold mb-3">Bizim Hikayemiz</h3>
                  <p className="text-foreground/80 mb-4">
                    İki yıl önce bir arkadaşımızın viski önerisiyle başlayan yolculuğumuzda, içkiyi sadece sarhoş olmak için değil; yeni deneyimler yaşamak, tatları keşfetmek ve öğrendiklerimizi başkalarına aktarmak için seven bir çift olduk.
                  </p>
                  <p className="text-foreground/80">
                    Her yudumda yeni bir hikaye, yeni bir keşif arıyoruz. Bu platformda, viskiyle ilgili öğrendiklerimizi ve heyecanımızı sizlerle paylaşmak istiyoruz. Bizimle birlikte bu yolculuğa katılın, sorularınızı ve deneyimlerinizi paylaşın. Çünkü viski, paylaştıkça daha keyifli!
                  </p>
                </div>
                
                <div>
                  <h3 className="font-serif text-xl font-semibold mb-3">Viski Yolculuğumuz</h3>
                  <p className="text-foreground/80 mb-4">
                    Viski ile tanışmamız üniversite yıllarına dayanıyor. İlk başlarda sadece basit blended viskiler içerken, zamanla damak zevkimiz gelişti ve farklı bölgelerin, damıtımevlerinin ve üretim tekniklerinin yarattığı çeşitliliği keşfetmeye başladık.
                  </p>
                  <p className="text-foreground/80">
                    İskoçya'dan Japonya'ya, Amerika'dan İrlanda'ya kadar dünyanın dört bir yanından viskileri tadarak kendi tercihlerimizi ve değerlendirme kriterlerimizi oluşturduk. Bu site, bu yolculuğun bir kaydı ve viski severlere bir rehber olması amacıyla oluşturuldu.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-serif text-xl font-semibold mb-3">Değerlendirme Kriterlerimiz</h3>
                  <p className="text-foreground/80 mb-4">
                    Her viski değerlendirmemizde tutarlı bir yaklaşım izlemeye çalışıyoruz. Değerlendirmelerimiz şu temel kriterlere dayanıyor:
                  </p>
                  
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Check size={20} className="text-primary mr-2 mt-0.5" />
                      <div>
                        <span className="font-medium">Aroma Profili:</span> Viskinin burnunda ve damakta sunduğu aromaların çeşitliliği, derinliği ve harmonisi.
                      </div>
                    </li>
                    <li className="flex items-start">
                      <Check size={20} className="text-primary mr-2 mt-0.5" />
                      <div>
                        <span className="font-medium">Karmaşıklık:</span> Viskinin sunduğu lezzet katmanları ve zamanla nasıl geliştiği.
                      </div>
                    </li>
                    <li className="flex items-start">
                      <Check size={20} className="text-primary mr-2 mt-0.5" />
                      <div>
                        <span className="font-medium">Denge:</span> Tatlılık, islilik, meyvemsilik, baharatlılık gibi farklı lezzet özelliklerinin uyumu.
                      </div>
                    </li>
                    <li className="flex items-start">
                      <Check size={20} className="text-primary mr-2 mt-0.5" />
                      <div>
                        <span className="font-medium">Bitiş:</span> Viskinin damakta bıraktığı son izlenim ve bu izlenimin süresi.
                      </div>
                    </li>
                    <li className="flex items-start">
                      <Check size={20} className="text-primary mr-2 mt-0.5" />
                      <div>
                        <span className="font-medium">Fiyat-Değer Oranı:</span> Viskinin sunduğu deneyimin fiyatına göre değerlendirilmesi.
                      </div>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-serif text-xl font-semibold mb-3">Bu Site Hakkında</h3>
                  <p className="text-foreground/80 mb-4">
                    VisTadım, kişisel viski deneyimlerimizi belgelemek ve viski severlerle paylaşmak için oluşturduğumuz bir platform. Burada bulunan tüm değerlendirmeler tamamen kişisel görüşlerimizi yansıtmaktadır ve profesyonel bir tadım eğitimi almış biri tarafından yapılmamıştır.
                  </p>
                  <p className="text-foreground/80">
                    Amacımız, hem kendi viski yolculuğumuzu kayıt altına almak hem de belki sizlere yeni keşifler için ilham vermektir. Sorularınız, yorumlarınız veya önerileriniz için bizimle iletişime geçmekten çekinmeyin!
                  </p>
                </div>
                
                <div>
                  <h3 className="font-serif text-xl font-semibold mb-3">Sorumluluk Reddi</h3>
                  <p className="text-foreground/80">
                    Bu sitede yer alan tüm içerikler sadece 18 yaş ve üzeri bireylere yöneliktir. Alkol tüketimi sağlığınız için zararlı olabilir; lütfen sorumlu tüketin. Sitedeki hiçbir içerik, alkol tüketimine teşvik olarak yorumlanmamalıdır.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutPage;