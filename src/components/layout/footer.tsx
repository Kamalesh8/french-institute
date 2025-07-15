import Link from "next/link";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
  FaEnvelope,
  FaPhone,
  FaGraduationCap,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <FaGraduationCap size={24} className="text-primary" />
              <h3 className="text-xl font-bold text-primary">L'école Bibliothèque</h3>
            </div>
            <p className="text-gray-300 text-sm">
              Explore French from A1 to C2 with immersive online and in-person courses -- led by native experts who make learning stylish smart and global.<br />Where Fluency meets flair.
            </p>
            <div className="flex space-x-4 mt-6">
              <a
                href="#"
                aria-label="Facebook"
                className="bg-blue-800 p-2 rounded-full hover:bg-blue-500 transition-colors"
              >
                <FaFacebook size={20} />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="bg-blue-800 p-2 rounded-full hover:bg-blue-500 transition-colors"
              >
                <FaTwitter size={20} />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="bg-blue-800 p-2 rounded-full hover:bg-blue-500 transition-colors"
              >
                <FaInstagram size={20} />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="bg-blue-800 p-2 rounded-full hover:bg-blue-500 transition-colors"
              >
                <FaLinkedin size={20} />
              </a>
              <a
                href="#"
                aria-label="YouTube"
                className="bg-blue-800 p-2 rounded-full hover:bg-blue-500 transition-colors"
              >
                <FaYoutube size={20} />
              </a>
            </div>
          </div>

          {/* Courses */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-primary">Courses</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/courses?level=A1"
                  className="text-gray-300 hover:text-primary text-sm transition-colors"
                >
                  A1 – Beginner
                </Link>
              </li>
              <li>
                <Link
                  href="/courses?level=A2"
                  className="text-gray-300 hover:text-primary text-sm transition-colors"
                >
                  A2 – Elementary
                </Link>
              </li>
              <li>
                <Link
                  href="/courses?level=B1"
                  className="text-gray-300 hover:text-primary text-sm transition-colors"
                >
                  B1 – Intermediate
                </Link>
              </li>
              <li>
                <Link
                  href="/courses?level=B2"
                  className="text-gray-300 hover:text-primary text-sm transition-colors"
                >
                  B2 – Upper Intermediate
                </Link>
              </li>
              <li>
                <Link
                  href="/courses?level=C1"
                  className="text-gray-300 hover:text-primary text-sm transition-colors"
                >
                  C1 – Advanced
                </Link>
              </li>
              <li>
                <Link
                  href="/courses?level=C2"
                  className="text-gray-300 hover:text-primary text-sm transition-colors"
                >
                  C2 – Proficiency
                </Link>
              </li>
              <li>
                <Link
                  href="/courses"
                  className="text-primary hover:underline text-sm transition-colors mt-2 inline-block"
                >
                  View All Courses
                </Link>
              </li>
            </ul>
          </div>

          {/* Study Materials */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-primary">Study Materials</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/resources/grammar"
                  className="text-gray-300 hover:text-primary text-sm transition-colors"
                >
                  Grammar Lessons
                </Link>
              </li>
              <li>
                <Link
                  href="/resources/vocabulary"
                  className="text-gray-300 hover:text-primary text-sm transition-colors"
                >
                  Vocabulary
                </Link>
              </li>
              <li>
                <Link
                  href="/resources/pronunciation"
                  className="text-gray-300 hover:text-primary text-sm transition-colors"
                >
                  Pronunciation
                </Link>
              </li>
              <li>
                <Link
                  href="/resources/exercises"
                  className="text-gray-300 hover:text-primary text-sm transition-colors"
                >
                  Practice Exercises
                </Link>
              </li>
              <li>
                <Link
                  href="/resources/blog"
                  className="text-gray-300 hover:text-primary text-sm transition-colors"
                >
                  French Culture Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/resources"
                  className="text-primary hover:underline text-sm transition-colors mt-2 inline-block"
                >
                  All Resources
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-primary">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center">
                <FaEnvelope className="text-primary mr-2 flex-shrink-0" />
                <a
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=ecolebibliotheque@gmail.com&su=Excited%20to%20Learn%20French%20with%20L%27ecole%20Bibliotheque&body=Bonjour%21%0A%0AI%20am%20interested%20in%20learning%20French%20with%20your%20institute.%0A%0APlease%20send%20me%20more%20information%20about%20courses%20and%20pricing.%0A%0AMerci%21"
                  target="_blank" rel="noopener noreferrer"className="text-sm text-gray-300 hover:text-primary transition-colors"
                >
                  ecolebibliotheque@gmail.com
                </a>
              </li>
              <li className="flex items-center">
                <FaPhone className="text-primary mr-2 flex-shrink-0 transform rotate-90" />
                <a
                  href="https://wa.me/916381668408?text=Bonjour!%0A%0AI%20am%20interested%20in%20learning%20French%20with%20your%20institute.%0A%0APlease%20send%20me%20more%20information%20about%20courses%20and%20pricing.%0A%0AMerci!" target="_blank" rel="noopener noreferrer"
                  className="text-sm text-gray-300 hover:text-primary transition-colors"
                >
                  +91 6381668408
                </a>
              </li>
            </ul>
            <div className="mt-4">
              <Link
                href="/contact"
                className="inline-flex items-center px-4 py-2 text-sm rounded-md bg-primary hover:bg-primary/80 text-white transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} L'école Bibliothèque. All rights
            reserved.
          </p>
          <div className="mt-4 md:mt-0 flex flex-wrap gap-4">
            <Link
              href="/about"
              className="text-sm text-gray-400 hover:text-primary transition-colors"
            >
              About Us
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-gray-400 hover:text-primary transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-gray-400 hover:text-primary transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/cookies"
              className="text-sm text-gray-400 hover:text-primary transition-colors"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
