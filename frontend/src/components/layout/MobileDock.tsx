import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  ShieldCheck,
  AlertTriangle,
  CheckSquare,
  MoreHorizontal,
  X,
  GitBranch,
  Building2,
  ScrollText,
  Lock,
} from 'lucide-react';

interface DockItem {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const PRIMARY_ITEMS: DockItem[] = [
  { to: '/dashboard',   icon: <LayoutDashboard size={22} />, label: 'Overview'    },
  { to: '/sops',        icon: <FileText        size={22} />, label: 'SOPs'        },
  { to: '/findings',    icon: <AlertTriangle   size={22} />, label: 'Findings'    },
  { to: '/regulations', icon: <ShieldCheck     size={22} />, label: 'Regulations' },
];

const MORE_ITEMS: DockItem[] = [
  { to: '/remediations',      icon: <CheckSquare  size={20} />, label: 'Remediation'   },
  { to: '/regulatory-changes',icon: <GitBranch    size={20} />, label: 'Changes'       },
  { to: '/organizations',     icon: <Building2    size={20} />, label: 'Organizations' },
  { to: '/audit',             icon: <ScrollText   size={20} />, label: 'Audit'         },
  { to: '/settings/security', icon: <Lock         size={20} />, label: 'Security'      },
];

export const MobileDock: React.FC = () => {
  const [moreOpen, setMoreOpen] = useState(false);
  const [visible, setVisible]   = useState(true);
  const location = useLocation();

  // Close "more" panel on route change
  useEffect(() => { setMoreOpen(false); }, [location.pathname]);

  // Scroll-hide dock when scrolling down, show when scrolling up
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const currentY = window.scrollY;
      if (currentY > lastY + 8 && currentY > 80) {
        setVisible(false);
        setMoreOpen(false);
      } else if (currentY < lastY - 8) {
        setVisible(true);
      }
      lastY = currentY;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* Backdrop for "more" panel */}
      {moreOpen && (
        <div
          className="dock-backdrop"
          onClick={() => setMoreOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* "More" panel — slides up above the dock */}
      <div className={`dock-more-panel${moreOpen ? ' open' : ''}`} role="dialog" aria-label="More navigation">
        <div className="dock-more-grid">
          {MORE_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `dock-more-item${isActive ? ' active' : ''}`
              }
            >
              <span className="dock-more-icon">{item.icon}</span>
              <span className="dock-more-label">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>

      {/* The dock itself */}
      <nav
        className={`mobile-dock${visible ? '' : ' hidden'}`}
        role="navigation"
        aria-label="Mobile navigation dock"
      >
        <div className="dock-track">
          {PRIMARY_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `dock-item${isActive ? ' active' : ''}`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="dock-icon">{item.icon}</span>
                  <span className="dock-label">{item.label}</span>
                  {isActive && <span className="dock-pip" aria-hidden="true" />}
                </>
              )}
            </NavLink>
          ))}

          {/* More button */}
          <button
            className={`dock-item${moreOpen ? ' active' : ''}`}
            onClick={() => setMoreOpen(v => !v)}
            aria-expanded={moreOpen}
            aria-label="More navigation options"
          >
            <span className="dock-icon" style={{ transition: 'transform 250ms cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
              {moreOpen ? <X size={22} /> : <MoreHorizontal size={22} />}
            </span>
            <span className="dock-label">{moreOpen ? 'Close' : 'More'}</span>
          </button>
        </div>
      </nav>
    </>
  );
};
