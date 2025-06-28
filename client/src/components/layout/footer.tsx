import { Brain } from "lucide-react";
import { FaGithub, FaTwitter, FaDiscord } from "react-icons/fa";
import { SiChainlink } from "react-icons/si";

export function Footer() {
  return (
    <footer className="bg-secondary text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Brain className="text-white text-sm" size={16} />
              </div>
              <span className="text-xl font-bold">C-PLAN</span>
            </div>
            <p className="text-gray-400">
              Smart wallet automation powered by AI and blockchain technology.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Technology</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="https://chain.link/functions" className="hover:text-white transition-colors flex items-center space-x-2">
                  <SiChainlink size={16} />
                  <span>Chainlink Functions</span>
                </a>
              </li>
              <li>
                <a href="https://chain.link/automation" className="hover:text-white transition-colors flex items-center space-x-2">
                  <SiChainlink size={16} />
                  <span>Chainlink Automation</span>
                </a>
              </li>
              <li><a href="#" className="hover:text-white transition-colors">ElizaOS Agents</a></li>
              <li><a href="https://wagmi.sh" className="hover:text-white transition-colors">Wagmi</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Community</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">GitHub</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Discord</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400">&copy; 2024 C-PLAN. Built for Chainlink Hackathon 2024.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <FaGithub size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <FaTwitter size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <FaDiscord size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
