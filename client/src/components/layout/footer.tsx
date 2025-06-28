import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-background border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-muted-foreground">
            © 2024 C-PLAN. All rights reserved.
          </div>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              About
            </a>
            <a href="/settings" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Settings
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;