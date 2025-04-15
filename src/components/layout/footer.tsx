import Link from "next/link";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube, FaMapMarkerAlt, FaEnvelope, FaPhone, FaGraduationCap } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <FaGraduationCap size={24} className="text-violet-400" />
              <h3 className="text-xl font-bold text-violet-400">French Institute</h3>
            </div>
            <p className="text-gray-300 text-sm">
              Learn French from A1 to C2 level with our comprehensive online and in-person
              courses taught by experienced native speakers. Our goal is to make French language
              learning accessible, enjoyable, and effective for students worldwide.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-violet-700 transition-colors">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-violet-700 transition-colors">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-violet-700 transition-colors">
                <FaInstagram size={20} />
              </a>
              <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-violet-700 transition-colors">
                <FaLinkedin size={20} />
              </a>
              <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-violet-700 transition-colors">
                <FaYoutube size={20} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4 text-violet-400">Courses</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/courses?level=A1" className="text-gray-300 hover:text-violet-400 text-sm transition-colors">
                  A1 - Beginner
                </Link>
              </li>
              <li>
                <Link href="/courses?level=A2" className="text-gray-300 hover:text-violet-400 text-sm transition-colors">
                  A2 - Elementary
                </Link>
              </li>
              <li>
                <Link href="/courses?level=B1" className="text-gray-300 hover:text-violet-400 text-sm transition-colors">
                  B1 - Intermediate
                </Link>
              </li>
              <li>
                <Link href="/courses?level=B2" className="text-gray-300 hover:text-violet-400 text-sm transition-colors">
                  B2 - Upper Intermediate
                </Link>
              </li>
              <li>
                <Link href="/courses?level=C1" className="text-gray-300 hover:text-violet-400 text-sm transition-colors">
                  C1 - Advanced
                </Link>
              </li>
              <li>
                <Link href="/courses?level=C2" className="text-gray-300 hover:text-violet-400 text-sm transition-colors">
                  C2 - Proficiency
                </Link>
              </li>
              <li>
                <Link href="/courses" className="text-violet-400 hover:underline text-sm transition-colors mt-2 inline-block">
                  View All Courses
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4 text-violet-400">Study Materials</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/resources/grammar" className="text-gray-300 hover:text-violet-400 text-sm transition-colors">
                  Grammar Lessons
                </Link>
              </li>
              <li>
                <Link href="/resources/vocabulary" className="text-gray-300 hover:text-violet-400 text-sm transition-colors">
                  Vocabulary
                </Link>
              </li>
              <li>
                <Link href="/resources/pronunciation" className="text-gray-300 hover:text-violet-400 text-sm transition-colors">
                  Pronunciation
                </Link>
              </li>
              <li>
                <Link href="/resources/exercises" className="text-gray-300 hover:text-violet-400 text-sm transition-colors">
                  Practice Exercises
                </Link>
              </li>
              <li>
                <Link href="/resources/blog" className="text-gray-300 hover:text-violet-400 text-sm transition-colors">
                  French Culture Blog
                </Link>
              </li>
              <li>
                <Link href="/resources" className="text-violet-400 hover:underline text-sm transition-colors mt-2 inline-block">
                  All Resources
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4 text-violet-400">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <FaMapMarkerAlt className="text-violet-400 mt-1 mr-2 flex-shrink-0" />
                <span className="text-sm text-gray-300">
                  123 Language Street
                  <br />Paris, 75001, France
                </span>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="text-violet-400 mr-2 flex-shrink-0" />
                <a href="mailto:contact@frenchinstitute.com" className="text-sm text-gray-300 hover:text-violet-400 transition-colors">
                  contact@frenchinstitute.com
                </a>
              </li>
              <li className="flex items-center">
                <FaPhone className="text-violet-400 mr-2 flex-shrink-0" />
                <a href="tel:+33123456789" className="text-sm text-gray-300 hover:text-violet-400 transition-colors">
                  +33 1 23 45 67 89
                </a>
              </li>
            </ul>
            <div className="mt-4">
              <Link href="/contact" className="inline-flex items-center px-4 py-2 text-sm rounded-md bg-violet-600 hover:bg-violet-700 text-white transition-colors">
                Contact Us
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} French Institute. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex flex-wrap gap-4">
            <Link href="/about" className="text-sm text-gray-400 hover:text-violet-400 transition-colors">
              About Us
            </Link>
            <Link href="/privacy" className="text-sm text-gray-400 hover:text-violet-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-gray-400 hover:text-violet-400 transition-colors">
              Terms of Service
            </Link>
            <Link href="/cookies" className="text-sm text-gray-400 hover:text-violet-400 transition-colors">
              Cookie Policy
            </Link>
            <Link href="/faqs" className="text-sm text-gray-400 hover:text-violet-400 transition-colors">
              FAQs
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
