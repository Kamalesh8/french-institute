import Link from "next/link";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="container py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-bold">French Institute</h3>
            <p className="text-muted-foreground text-sm">
              Learn French from A1 to C2 level with our comprehensive online
              courses taught by experienced native speakers.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
                <FaInstagram size={20} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
                <FaLinkedin size={20} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
                <FaYoutube size={20} />
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Courses</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/courses/a1" className="text-muted-foreground hover:text-primary text-sm">
                  A1 - Beginner
                </Link>
              </li>
              <li>
                <Link href="/courses/a2" className="text-muted-foreground hover:text-primary text-sm">
                  A2 - Elementary
                </Link>
              </li>
              <li>
                <Link href="/courses/b1" className="text-muted-foreground hover:text-primary text-sm">
                  B1 - Intermediate
                </Link>
              </li>
              <li>
                <Link href="/courses/b2" className="text-muted-foreground hover:text-primary text-sm">
                  B2 - Upper Intermediate
                </Link>
              </li>
              <li>
                <Link href="/courses/c1" className="text-muted-foreground hover:text-primary text-sm">
                  C1 - Advanced
                </Link>
              </li>
              <li>
                <Link href="/courses/c2" className="text-muted-foreground hover:text-primary text-sm">
                  C2 - Proficiency
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/resources/blog" className="text-muted-foreground hover:text-primary text-sm">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/resources/vocabulary" className="text-muted-foreground hover:text-primary text-sm">
                  Vocabulary
                </Link>
              </li>
              <li>
                <Link href="/resources/grammar" className="text-muted-foreground hover:text-primary text-sm">
                  Grammar
                </Link>
              </li>
              <li>
                <Link href="/resources/exercises" className="text-muted-foreground hover:text-primary text-sm">
                  Free Exercises
                </Link>
              </li>
              <li>
                <Link href="/resources/faq" className="text-muted-foreground hover:text-primary text-sm">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="text-sm text-muted-foreground">
                123 Language Street
              </li>
              <li className="text-sm text-muted-foreground">
                Paris, France
              </li>
              <li className="text-sm text-muted-foreground">
                contact@frenchinstitute.com
              </li>
              <li className="text-sm text-muted-foreground">
                +33 1 23 45 67 89
              </li>
            </ul>
            <div className="mt-4">
              <Link href="/contact" className="text-primary hover:underline text-sm">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} French Institute. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary">
              Terms of Service
            </Link>
            <Link href="/cookies" className="text-sm text-muted-foreground hover:text-primary">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
