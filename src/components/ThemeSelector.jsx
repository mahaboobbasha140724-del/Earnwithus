import React, { useState, useRef, useEffect } from 'react';
import { useTheme, THEMES } from '../context/ThemeContext';
import { ChevronDown, Check, Palette } from 'lucide-react';

export default function ThemeSelector({ isMobile = false }) {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentThemeObj = THEMES.find((t) => t.id === theme) || THEMES[0];
  const CurrentIcon = currentThemeObj.icon;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isMobile) {
    return (
      <div style={{ marginTop: '12px', marginBottom: '12px' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Palette size={14} /> Theme Selector
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          {THEMES.map((t) => {
            const IconComponent = t.icon;
            const isSelected = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 6px',
                  borderRadius: '10px',
                  border: isSelected ? `2px solid ${t.color}` : '1px solid var(--border-light)',
                  backgroundColor: isSelected ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                  color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: `${t.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.color }}>
                  <IconComponent size={14} />
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: isSelected ? 700 : 500 }}>
                  {t.name.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '7px 12px',
          borderRadius: '9999px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-light)',
          color: 'var(--text-primary)',
          fontSize: '0.85rem',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          outline: 'none',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-hover)';
          e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-light)';
          e.currentTarget.style.backgroundColor = 'var(--bg-card)';
        }}
        aria-label="Select theme"
      >
        <span
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: `${currentThemeObj.color}25`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: currentThemeObj.color,
          }}
        >
          <CurrentIcon size={12} />
        </span>
        <span>{currentThemeObj.name.split(' ')[0]}</span>
        <ChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s ease', color: 'var(--text-muted)' }} />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '210px',
            backgroundColor: 'var(--bg-dropdown)',
            border: '1px solid var(--border-light)',
            borderRadius: '14px',
            padding: '6px',
            boxShadow: 'var(--shadow-premium)',
            zIndex: 1000,
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div style={{ padding: '6px 10px 8px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--border-light)', marginBottom: '4px' }}>
            Theme Options
          </div>
          {THEMES.map((t) => {
            const IconComp = t.icon;
            const isSelected = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setTheme(t.id);
                  setIsOpen(false);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 10px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: isSelected ? 'var(--bg-card-hover)' : 'transparent',
                  color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: '0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      backgroundColor: `${t.color}22`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: t.color,
                    }}
                  >
                    <IconComp size={14} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: isSelected ? 700 : 500 }}>
                      {t.name}
                    </div>
                  </div>
                </div>
                {isSelected && <Check size={14} style={{ color: t.color }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
