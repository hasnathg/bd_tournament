import React from 'react';

const Footer = () => {
    return (
        <footer className="footer footer-center p-4 bg-base-200 text-base-content">
      <aside>
        <p className="text-sm">
          © {new Date().getFullYear()} BD Tournament. All rights reserved.
        </p>
      </aside>
    </footer>
    );
};

export default Footer;