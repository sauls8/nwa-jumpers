import React from 'react';

function App() {
  return (
    <div style={{ 
      padding: '2rem', 
      textAlign: 'center', 
      backgroundColor: '#f0f2f5',
      color: 'black',
      minHeight: '100vh',
      width: '100vw',
      margin: 0,
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h1 style={{ color: '#646cff', fontSize: '3rem', marginBottom: '1rem' }}>🎪 NWA Jumpers</h1>
      <p style={{ fontSize: '1.5rem', marginBottom: '2rem', color: '#666' }}>Bounce House Rentals</p>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
        gridTemplateRows: 'repeat(2, 1fr)',
        gap: '2rem', 
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        marginBottom: '2rem',
        padding: '0 2rem',
        minHeight: '70vh'
      }}>
        <div style={{ 
          padding: '2.5rem', 
          border: '3px solid #646cff', 
          borderRadius: '12px',
          backgroundColor: '#f8f9ff',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          minHeight: '200px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = '0 8px 15px rgba(0,0,0,0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏰</div>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#646cff', fontSize: '1.5rem' }}>Castle</h3>
          <p style={{ margin: 0, color: '#666' }}>Magical castle adventures for your little prince or princess</p>
        </div>
        
        <div style={{ 
          padding: '2.5rem', 
          border: '3px solid #3B82F6', 
          borderRadius: '12px',
          backgroundColor: '#f0f8ff',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          minHeight: '200px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = '0 8px 15px rgba(0,0,0,0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🦸</div>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#3B82F6', fontSize: '1.5rem' }}>Superhero</h3>
          <p style={{ margin: 0, color: '#666' }}>Superhero training grounds for your little heroes</p>
        </div>
        
        <div style={{ 
          padding: '2.5rem', 
          border: '3px solid #10B981', 
          borderRadius: '12px',
          backgroundColor: '#f0fdf4',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          minHeight: '200px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = '0 8px 15px rgba(0,0,0,0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏈</div>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#10B981', fontSize: '1.5rem' }}>Sports</h3>
          <p style={{ margin: 0, color: '#666' }}>Sports-themed fun for active kids and families</p>
        </div>
        
        <div style={{ 
          padding: '2.5rem', 
          border: '3px solid #F59E0B', 
          borderRadius: '12px',
          backgroundColor: '#fffbeb',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          minHeight: '200px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = '0 8px 15px rgba(0,0,0,0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👶</div>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#F59E0B', fontSize: '1.5rem' }}>Toddler</h3>
          <p style={{ margin: 0, color: '#666' }}>Safe and fun inflatables designed for little ones</p>
        </div>
        
        {/* Coming Soon Cards */}
        <div style={{ 
          padding: '2.5rem', 
          border: '3px solid #6B7280', 
          borderRadius: '12px',
          backgroundColor: '#f9fafb',
          cursor: 'not-allowed',
          opacity: '0.6',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          position: 'relative',
          minHeight: '200px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎪</div>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#6B7280', fontSize: '1.5rem' }}>Coming Soon</h3>
          <p style={{ margin: 0, color: '#9CA3AF' }}>More amazing inflatables coming soon!</p>
        </div>
        
        <div style={{ 
          padding: '2.5rem', 
          border: '3px solid #6B7280', 
          borderRadius: '12px',
          backgroundColor: '#f9fafb',
          cursor: 'not-allowed',
          opacity: '0.6',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          position: 'relative',
          minHeight: '200px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎨</div>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#6B7280', fontSize: '1.5rem' }}>Coming Soon</h3>
          <p style={{ margin: 0, color: '#9CA3AF' }}>More amazing inflatables coming soon!</p>
        </div>
        
        <div style={{ 
          padding: '2.5rem', 
          border: '3px solid #6B7280', 
          borderRadius: '12px',
          backgroundColor: '#f9fafb',
          cursor: 'not-allowed',
          opacity: '0.6',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          position: 'relative',
          minHeight: '200px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌟</div>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#6B7280', fontSize: '1.5rem' }}>Coming Soon</h3>
          <p style={{ margin: 0, color: '#9CA3AF' }}>More amazing inflatables coming soon!</p>
        </div>
        
        <div style={{ 
          padding: '2.5rem', 
          border: '3px solid #6B7280', 
          borderRadius: '12px',
          backgroundColor: '#f9fafb',
          cursor: 'not-allowed',
          opacity: '0.6',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          position: 'relative',
          minHeight: '200px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎭</div>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#6B7280', fontSize: '1.5rem' }}>Coming Soon</h3>
          <p style={{ margin: 0, color: '#9CA3AF' }}>More amazing inflatables coming soon!</p>
        </div>
      </div>
      
      <div style={{ marginTop: '2rem' }}>
        <p style={{ color: '#666', fontSize: '1.1rem' }}>🎉 Click on a category to see inflatables and start your booking!</p>
        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px', maxWidth: '600px', margin: '1rem auto' }}>
          <p style={{ margin: 0, color: '#495057', fontSize: '0.9rem' }}>
            <strong>Coming Soon:</strong> Interactive booking system with calendar availability, 
            real-time pricing, and instant confirmation!
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
