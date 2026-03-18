import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacyverklaring',
  description: 'Privacyverklaring van De Kaaswinkel conform de AVG/GDPR.',
}

const shopName = process.env.NEXT_PUBLIC_SHOP_NAME || 'De Kaaswinkel'
const shopEmail = process.env.NEXT_PUBLIC_SHOP_EMAIL || 'info@yourshop.nl'

export default function PrivacyPage() {
  const today = new Date().toLocaleDateString('nl-NL', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 pt-[var(--header-height)]">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <h1 className="font-serif text-4xl text-earth-900 mb-3">Privacyverklaring</h1>
          <p className="text-earth-500 mb-10">Laatst bijgewerkt: {today}</p>

          <div className="prose prose-earth max-w-none space-y-8 text-earth-700 leading-relaxed">

            <section>
              <h2 className="font-serif text-2xl text-earth-900 mb-3">1. Wie zijn wij?</h2>
              <p>
                {shopName} is een eenmanszaak gevestigd in Nederland. Wij verkopen ambachtelijke kazen aan particulieren.
                Voor vragen over uw persoonsgegevens kunt u contact met ons opnemen via:{' '}
                <a href={`mailto:${shopEmail}`} className="text-cheese-600 hover:underline">{shopEmail}</a>.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-earth-900 mb-3">2. Welke gegevens verzamelen wij?</h2>
              <p>Wij verzamelen en verwerken de volgende persoonsgegevens wanneer u een bestelling plaatst:</p>
              <ul className="list-disc list-inside mt-3 space-y-1 ml-4">
                <li>Naam</li>
                <li>E-mailadres</li>
                <li>Telefoonnummer (optioneel)</li>
                <li>Bezorgadres (straat, postcode, plaatsnaam)</li>
                <li>Bestelde producten en bijbehorende bedragen</li>
                <li>Eventuele opmerkingen bij de bestelling</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-earth-900 mb-3">3. Waarom verwerken wij uw gegevens?</h2>
              <p>Uw gegevens worden uitsluitend gebruikt voor:</p>
              <ul className="list-disc list-inside mt-3 space-y-1 ml-4">
                <li>Het verwerken en bezorgen van uw bestelling</li>
                <li>Het verzenden van een bestellingsbevestiging per e-mail</li>
                <li>Contact met u opnemen over uw bestelling (bijv. leveringsdatum)</li>
              </ul>
              <p className="mt-3">
                De wettelijke grondslag is <strong>uitvoering van een overeenkomst</strong> (artikel 6 lid 1 sub b AVG).
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-earth-900 mb-3">4. Worden uw gegevens gedeeld?</h2>
              <p>
                Wij delen uw persoonsgegevens <strong>niet</strong> met derden, behalve wanneer dit noodzakelijk is voor
                de uitvoering van uw bestelling (zoals een bezorgdienst) of wanneer wij hiertoe wettelijk verplicht zijn.
              </p>
              <p className="mt-3">
                Wij maken gebruik van <strong>Resend</strong> voor het verzenden van bevestigingsmails.
                Resend verwerkt uitsluitend uw naam en e-mailadres ten behoeve van het versturen van de e-mail.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-earth-900 mb-3">5. Hoe lang bewaren wij uw gegevens?</h2>
              <p>
                Wij bewaren uw bestelgegevens zolang dit noodzakelijk is voor de uitvoering van de bestelling en
                voor het voldoen aan wettelijke bewaarplichten (fiscale bewaarplicht: 7 jaar).
                Daarna worden uw gegevens verwijderd.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-earth-900 mb-3">6. Beveiliging</h2>
              <p>
                Wij nemen passende technische en organisatorische maatregelen om uw persoonsgegevens te beveiligen
                tegen ongeoorloofde toegang, verlies of misbruik. Uw gegevens worden opgeslagen in een beveiligde
                database. Wachtwoorden worden versleuteld opgeslagen.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-earth-900 mb-3">7. Uw rechten</h2>
              <p>Op grond van de AVG heeft u de volgende rechten:</p>
              <ul className="list-disc list-inside mt-3 space-y-1 ml-4">
                <li><strong>Recht op inzage</strong>: u kunt opvragen welke gegevens wij van u hebben</li>
                <li><strong>Recht op rectificatie</strong>: u kunt onjuiste gegevens laten corrigeren</li>
                <li><strong>Recht op verwijdering</strong>: u kunt verzoeken uw gegevens te laten verwijderen</li>
                <li><strong>Recht op beperking</strong>: u kunt de verwerking laten beperken</li>
                <li><strong>Recht van bezwaar</strong>: u kunt bezwaar maken tegen de verwerking</li>
              </ul>
              <p className="mt-3">
                Om gebruik te maken van uw rechten kunt u contact opnemen via{' '}
                <a href={`mailto:${shopEmail}`} className="text-cheese-600 hover:underline">{shopEmail}</a>.
                Wij reageren binnen 30 dagen.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-earth-900 mb-3">8. Klachten</h2>
              <p>
                Heeft u een klacht over de manier waarop wij uw persoonsgegevens verwerken?
                Dan kunt u een klacht indienen bij de{' '}
                <a
                  href="https://autoriteitpersoonsgegevens.nl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cheese-600 hover:underline"
                >
                  Autoriteit Persoonsgegevens
                </a>.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-earth-900 mb-3">9. Cookies</h2>
              <p>
                Deze website maakt gebruik van functionele cookies (winkelwagen) die noodzakelijk zijn voor het
                functioneren van de webshop. Er worden geen tracking- of advertentiecookies gebruikt.
                De winkelwagengegevens worden lokaal in uw browser opgeslagen en worden niet naar onze servers gestuurd.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-earth-900 mb-3">10. Wijzigingen</h2>
              <p>
                Wij kunnen deze privacyverklaring van tijd tot tijd bijwerken. De meest recente versie vindt u altijd
                op deze pagina. Wij raden u aan deze pagina regelmatig te raadplegen.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
