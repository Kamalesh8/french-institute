import React from 'react';
import EmojiBackground from '@/components/visual/EmojiBackground';

export default function AboutPage() {
  return (
    <main className="relative container mx-auto max-w-4xl py-16 space-y-16 text-foreground">
      <EmojiBackground />
      {/* Hero */}
      <section className="text-center space-y-6">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          🚀 About Us – <span className="text-primary">L’école&nbsp;Bibliothèque</span>
        </h1>
        <h2 className="text-xl sm:text-2xl font-medium text-muted-foreground">
          One place, 1000 ideas.
        </h2>
        <p className="mx-auto max-w-2xl text-lg sm:text-xl leading-relaxed">
          That’s not just our motto—it’s our mindset. At L’école Bibliothèque, we’re not your average language institute. We’re a creative playground for dreamers, thinkers, and global explorers. French isn’t just a subject here. It’s your ticket to new ways of seeing, speaking, and succeeding.
        </p>
      </section>

      {/* Why Bibliothèque */}
      <section className="space-y-4">
        <h3 className="text-2xl sm:text-3xl font-semibold">📚 Why &quot;Bibliothèque&quot;?</h3>
        <p className="text-lg leading-relaxed">
          Because libraries aren’t quiet anymore. They’re full of voices, visions, and endless possibilities. Our classrooms are just like that—dynamic, expressive, and full of discovery.
        </p>
      </section>

      {/* Built for the now */}
      <section className="space-y-4">
        <h3 className="text-2xl sm:text-3xl font-semibold">✨ We’re built for the now:</h3>
        <ul className="list-disc list-inside space-y-2 text-lg">
          <li>Modern learning methods to ditch the boring and bring in the brilliant.</li>
          <li>Culture meets language—French cinema nights, café-style conversations, and meme-worthy grammar hacks.</li>
          <li>Goals that grow with you—Whether it’s acing an exam or flirting in French, we’re here for it.</li>
        </ul>
      </section>

      {/* Closing */}
      <section className="space-y-4 text-lg">
        <p>
          👩‍🎓👨‍🎓 For students, hustlers, travelers, artists, and anyone with a <em>bonjour</em> in their heart—this is your space.
        </p>
        <p>
          So, come in. Be inspired. Spark ideas.
          <br />
          Because here, one place holds a thousand ways to be extraordinary.
        </p>
      </section>
    </main>
  );
}
