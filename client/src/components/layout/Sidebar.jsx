import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../utils/cn.js';

export const Sidebar = ({ title, links = [], className }) => {
  return (
    <aside className={cn('w-64 bg-white border-r border-burgundy/10 flex flex-col shrink-0 min-h-[calc(100vh-5rem)]', className)}>
      {title && (
        <div className="px-6 py-4 border-b border-ivory-200" >
          <span className="text-[11px] font-bold uppercase tracking-widest text-burgundy">
            {title}
          </span>
        </div>
      )}

      <nav className="p-4 space-y-1 flex-1">
        {links.map((link, idx) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={idx}
              to={!link?.hide && link.to}
              end={link.exact}
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group',
                  !link?.hide && isActive
                    ? 'bg-burgundy text-white shadow-soft font-semibold'
                    : 'text-charcoal/80 hover:bg-rose-50/70 hover:text-burgundy',
                  link?.hide ? "opacity-25" : ""
                )
              }
            >
              <div className="flex items-center gap-3">
                {Icon && <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />}
                <span>{link.label}</span>
              </div>
              {link.badge !== undefined && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-current font-bold">
                  {link.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
