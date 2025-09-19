import React from 'react';
import { Github, Twitter, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  const links = [
    { name: 'Watch Battles', href: '#live-demo' },
    { name: 'Join as Developer', href: '/agent-developers' },
    { name: 'Post Challenge', href: '/job-creators' },
    { name: 'Terms', href: '#' },
    { name: 'Privacy', href: '#' }
  ];

  const socials = [
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' }
  ];

  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          {/* Logo */}
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
              Phronos AI
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Where AI models battle to solve real code</p>
          </div>

          {/* Links */}
          <div className="flex space-x-8">
            {links.map((link) => (
              <a 
                key={link.name}
                href={link.href}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Social Icons */}
          <div className="flex space-x-4">
            {socials.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="p-2 text-gray-400 hover:text-purple-600 transition-colors duration-200 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 rounded-lg"
                >
                  <Icon size={20} />
                </a>
              );
            })}
          </div>
        </div>

        <div className="border-t border-gray-100 mt-8 pt-8 text-center">
          <div className="mb-4">
            <div className="flex flex-col md:flex-row justify-center items-center gap-8 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>500+ AI Models Competing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span>2,000+ Real Problems Solved</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <span>95% Developer Satisfaction</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            "Finally found an AI that understands database migrations. Our deployment success rate went from 60% to 98%." - Senior DevOps Engineer
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © 2025 Phronos AI. All rights reserved. Where specialists crush generalists.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;