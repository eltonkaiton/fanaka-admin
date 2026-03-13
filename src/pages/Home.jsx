import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  IoSearch,
  IoStar,
  IoCalendar,
  IoTime,
  IoLocation,
  IoPeople,
  IoArrowForward,
  IoChatbubbles,
  IoTicket,
  IoCall,
  IoCloseCircle,
  IoBusiness,
  IoCalendarOutline,
  IoTimeOutline,
  IoLocationOutline,
  IoPeopleOutline,
} from 'react-icons/io5';

const API_BASE_URL = 'http://localhost:5000';

export default function Home() {
  const navigate = useNavigate();
  const [plays, setPlays] = useState([]);
  const [filteredPlays, setFilteredPlays] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [featuredPlays, setFeaturedPlays] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeFeatured, setActiveFeatured] = useState(0);
  const featuredRef = useRef(null);

  const categories = [
    { id: 'all', label: 'All Plays' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'thisWeek', label: 'This Week' },
    { id: 'popular', label: 'Popular' },
  ];

  useEffect(() => {
    fetchPlays();
  }, []);

  useEffect(() => {
    filterAndSortPlays();
  }, [search, plays, activeCategory]);

  const fetchPlays = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/plays`);
      const sorted = response.data.sort(
        (a, b) => new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt)
      );
      setPlays(sorted);
      setFeaturedPlays(sorted.slice(0, 3));
    } catch (error) {
      console.log('Error fetching plays:', error);
      alert('Failed to fetch plays. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPlays();
  };

  const filterAndSortPlays = () => {
    let filtered = [...plays];

    if (search.trim() !== '') {
      filtered = filtered.filter(
        (p) =>
          p.title?.toLowerCase().includes(search.toLowerCase()) ||
          p.description?.toLowerCase().includes(search.toLowerCase()) ||
          p.venue?.toLowerCase().includes(search.toLowerCase()) ||
          p.actors?.some((actor) =>
            actor.toLowerCase().includes(search.toLowerCase())
          )
      );
    }

    const now = new Date();
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    switch (activeCategory) {
      case 'upcoming':
        filtered = filtered.filter((play) => new Date(play.date) > now);
        break;
      case 'thisWeek':
        filtered = filtered.filter((play) => {
          const playDate = new Date(play.date);
          return playDate > now && playDate <= oneWeekFromNow;
        });
        break;
      case 'popular':
        filtered = filtered.slice(0, 6);
        break;
      default:
        break;
    }

    filtered.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
    setFilteredPlays(filtered);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath)
      return 'https://images.unsplash.com/photo-1531263060786-566ad8b6d79d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_BASE_URL}${imagePath}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBD';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil(Math.abs(date - now) / (1000 * 60 * 60 * 24));
    if (diffDays <= 7) {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    }
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleFeaturedScroll = (e) => {
    const scrollLeft = e.target.scrollLeft;
    const itemWidth = e.target.offsetWidth;
    const index = Math.round(scrollLeft / itemWidth);
    setActiveFeatured(index);
  };

  const styles = {
    container: {
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      paddingBottom: 20,
    },
    loader: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
    },
    loadingText: {
      marginTop: 12,
      fontSize: 16,
      color: '#666',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '15px 20px',
    },
    headerButtons: {
      display: 'flex',
      gap: 12,
    },
    welcomeText: {
      fontSize: 14,
      color: '#666',
      marginBottom: 2,
    },
    appName: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#6200EE',
      marginBottom: 4,
    },
    tagline: {
      fontSize: 14,
      color: '#666',
    },
    iconButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1px solid #E1BEE7',
      backgroundColor: '#F3E5F5',
      cursor: 'pointer',
    },
    chatButton: {
      backgroundColor: '#E3F2FD',
      borderColor: '#BBDEFB',
    },
    searchContainer: {
      display: 'flex',
      alignItems: 'center',
      backgroundColor: '#fff',
      margin: '0 20px 20px',
      padding: '8px 15px',
      borderRadius: 12,
      border: '1px solid #E0E0E0',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    },
    searchIcon: {
      marginRight: 10,
      color: '#666',
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      border: 'none',
      outline: 'none',
      padding: '8px 0',
    },
    clearSearch: {
      cursor: 'pointer',
      color: '#999',
    },
    featuredSection: {
      marginBottom: 25,
    },
    sectionHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 20px',
      marginBottom: 15,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#1F2937',
    },
    seeAll: {
      fontSize: 14,
      color: '#6200EE',
      fontWeight: '500',
      cursor: 'pointer',
    },
    featuredScroll: {
      display: 'flex',
      overflowX: 'auto',
      scrollSnapType: 'x mandatory',
      gap: 15,
      padding: '0 15px',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
    },
    featuredCard: {
      flex: '0 0 auto',
      width: 'calc(100% - 30px)',
      maxWidth: 500,
      scrollSnapAlign: 'start',
      borderRadius: 20,
      overflow: 'hidden',
      boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
      position: 'relative',
      cursor: 'pointer',
    },
    featuredImage: {
      width: '100%',
      height: 250,
      objectFit: 'cover',
      display: 'block',
    },
    featuredOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 60%)',
      padding: 20,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    },
    featuredBadge: {
      display: 'flex',
      alignItems: 'center',
      alignSelf: 'flex-start',
      backgroundColor: 'rgba(98,0,238,0.9)',
      padding: '6px 12px',
      borderRadius: 20,
      gap: 6,
    },
    featuredBadgeText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '600',
      letterSpacing: 0.5,
    },
    featuredContent: {
      marginTop: 'auto',
    },
    featuredTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#fff',
      marginBottom: 10,
      textShadow: '1px 1px 3px rgba(0,0,0,0.5)',
    },
    featuredDetail: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 6,
    },
    featuredDetailText: {
      color: '#fff',
      fontSize: 14,
      textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
    },
    priceTag: {
      alignSelf: 'flex-start',
      backgroundColor: '#fff',
      padding: '8px 15px',
      borderRadius: 20,
      marginTop: 10,
    },
    priceText: {
      color: '#6200EE',
      fontSize: 14,
      fontWeight: 'bold',
    },
    pagination: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 15,
      gap: 8,
    },
    paginationDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#6200EE',
      transition: 'all 0.3s',
    },
    paginationDotActive: {
      width: 20,
    },
    categoriesSection: {
      marginBottom: 25,
    },
    categoriesScroll: {
      display: 'flex',
      overflowX: 'auto',
      gap: 10,
      padding: '0 20px',
      scrollbarWidth: 'none',
    },
    categoryButton: {
      padding: '10px 20px',
      backgroundColor: '#fff',
      borderRadius: 25,
      border: '1px solid #E5E7EB',
      fontSize: 14,
      fontWeight: '500',
      color: '#6B7280',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
    },
    categoryButtonActive: {
      backgroundColor: '#6200EE',
      borderColor: '#6200EE',
      color: '#fff',
    },
    playsSection: {
      marginBottom: 25,
    },
    playsCount: {
      fontSize: 14,
      color: '#6B7280',
    },
    playsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: 15,
      padding: '0 15px',
    },
    playCard: {
      backgroundColor: '#fff',
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: '0 4px 8px rgba(0,0,0,0.08)',
      cursor: 'pointer',
    },
    playCardImageContainer: {
      position: 'relative',
      height: 150,
    },
    playCardImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    upcomingBadge: {
      position: 'absolute',
      top: 10,
      left: 10,
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      backgroundColor: 'rgba(76,175,80,0.9)',
      padding: '4px 8px',
      borderRadius: 12,
    },
    upcomingBadgeText: {
      color: '#fff',
      fontSize: 10,
      fontWeight: '600',
    },
    playCardPrice: {
      position: 'absolute',
      bottom: 10,
      left: 10,
      backgroundColor: 'rgba(255,255,255,0.95)',
      padding: '4px 10px',
      borderRadius: 12,
    },
    playCardPriceText: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#6200EE',
    },
    playCardContent: {
      padding: 12,
    },
    playCardTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#1F2937',
      marginBottom: 8,
      lineHeight: 20,
    },
    playCardDetail: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      marginBottom: 4,
    },
    playCardDetailText: {
      fontSize: 12,
      color: '#6B7280',
    },
    playCardDescription: {
      fontSize: 12,
      color: '#6B7280',
      lineHeight: 16,
      marginBottom: 12,
    },
    playCardFooter: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    actorsContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      flex: 1,
    },
    actorsText: {
      fontSize: 10,
      color: '#6B7280',
    },
    bookButton: {
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      backgroundColor: '#6200EE',
      padding: '6px 12px',
      borderRadius: 8,
      border: 'none',
      cursor: 'pointer',
      color: '#fff',
      fontSize: 12,
      fontWeight: '600',
    },
    emptyContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      textAlign: 'center',
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#1F2937',
      marginTop: 16,
      marginBottom: 8,
    },
    emptyText: {
      fontSize: 16,
      color: '#6B7280',
      marginBottom: 20,
      lineHeight: 22,
    },
    emptyButton: {
      backgroundColor: '#6200EE',
      padding: '12px 24px',
      borderRadius: 8,
      border: 'none',
      cursor: 'pointer',
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
    },
    quickActions: {
      display: 'flex',
      justifyContent: 'space-around',
      padding: '0 20px',
      marginBottom: 25,
    },
    quickAction: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      cursor: 'pointer',
      flex: 1,
    },
    quickActionIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    quickActionText: {
      fontSize: 12,
      color: '#333',
      fontWeight: '500',
    },
    footer: {
      textAlign: 'center',
      padding: '20px',
      borderTop: '1px solid #E5E7EB',
    },
    footerText: {
      fontSize: 14,
      color: '#6B7280',
      marginBottom: 4,
    },
    footerSubText: {
      fontSize: 12,
      color: '#9CA3AF',
      fontStyle: 'italic',
    },
  };

  if (loading && !refreshing) {
    return (
      <div style={styles.loader}>
        <div className="spinner"></div>
        <p style={styles.loadingText}>Loading amazing plays...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <p style={styles.welcomeText}>Welcome to</p>
          <h1 style={styles.appName}>Fanaka Arts</h1>
          <p style={styles.tagline}>Experience World-Class Theater</p>
        </div>
        <div style={styles.headerButtons}>
          <button
            style={{ ...styles.iconButton, ...styles.chatButton }}
            onClick={() => navigate('/home/audience-chat')}
          >
            <IoChatbubbles size={24} color="#6200EE" />
          </button>
          <button
            style={styles.iconButton}
            onClick={() => navigate('/home/my-bookings')}
          >
            <IoTicket size={24} color="#6200EE" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={styles.searchContainer}>
        <IoSearch size={20} style={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search plays, actors, or venues..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />
        {search.length > 0 && (
          <IoCloseCircle
            size={20}
            style={styles.clearSearch}
            onClick={() => setSearch('')}
          />
        )}
      </div>

      {/* Featured Plays */}
      {featuredPlays.length > 0 && (
        <div style={styles.featuredSection}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Featured Plays</h2>
            <span style={styles.seeAll} onClick={() => setActiveCategory('all')}>
              See All
            </span>
          </div>

          <div
            ref={featuredRef}
            style={styles.featuredScroll}
            onScroll={handleFeaturedScroll}
          >
            {featuredPlays.map((play, index) => (
              <div
                key={play._id}
                style={styles.featuredCard}
                onClick={() => navigate(`/home/play-details/${play._id}`)}
              >
                <img
                  src={getImageUrl(play.image)}
                  alt={play.title}
                  style={styles.featuredImage}
                />
                <div style={styles.featuredOverlay}>
                  <div style={styles.featuredBadge}>
                    <IoStar size={16} color="#FFD700" />
                    <span style={styles.featuredBadgeText}>FEATURED</span>
                  </div>
                  <div style={styles.featuredContent}>
                    <h3 style={styles.featuredTitle}>{play.title}</h3>
                    <div>
                      <div style={styles.featuredDetail}>
                        <IoCalendar size={14} color="#fff" />
                        <span style={styles.featuredDetailText}>
                          {formatDate(play.date)}
                        </span>
                      </div>
                      <div style={styles.featuredDetail}>
                        <IoTime size={14} color="#fff" />
                        <span style={styles.featuredDetailText}>
                          {getTime(play.date)}
                        </span>
                      </div>
                      <div style={styles.featuredDetail}>
                        <IoLocation size={14} color="#fff" />
                        <span style={styles.featuredDetailText}>
                          {play.venue || 'Main Theater'}
                        </span>
                      </div>
                    </div>
                    <div style={styles.priceTag}>
                      <span style={styles.priceText}>
                        FROM KES {play.regularPrice || 1500}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Dots */}
          <div style={styles.pagination}>
            {featuredPlays.map((_, index) => (
              <div
                key={index}
                style={{
                  ...styles.paginationDot,
                  ...(index === activeFeatured ? styles.paginationDotActive : {}),
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      <div style={styles.categoriesSection}>
        <div style={styles.categoriesScroll}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              style={{
                ...styles.categoryButton,
                ...(activeCategory === cat.id ? styles.categoryButtonActive : {}),
              }}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Plays Grid */}
      <div style={styles.playsSection}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>
            {activeCategory === 'all'
              ? 'All Plays'
              : activeCategory === 'upcoming'
              ? 'Upcoming Plays'
              : activeCategory === 'thisWeek'
              ? 'This Week'
              : 'Popular Plays'}
          </h2>
          <span style={styles.playsCount}>
            {filteredPlays.length} {filteredPlays.length === 1 ? 'play' : 'plays'}
          </span>
        </div>

        {filteredPlays.length > 0 ? (
          <div style={styles.playsGrid}>
            {filteredPlays.map((play) => (
              <div
                key={play._id}
                style={styles.playCard}
                onClick={() => navigate(`/home/play-details/${play._id}`)}
              >
                <div style={styles.playCardImageContainer}>
                  <img
                    src={getImageUrl(play.image)}
                    alt={play.title}
                    style={styles.playCardImage}
                  />
                  {new Date(play.date) > new Date() && (
                    <div style={styles.upcomingBadge}>
                      <IoCalendar size={12} color="#fff" />
                      <span style={styles.upcomingBadgeText}>UPCOMING</span>
                    </div>
                  )}
                  <div style={styles.playCardPrice}>
                    <span style={styles.playCardPriceText}>
                      KES {play.regularPrice || 1500}
                    </span>
                  </div>
                </div>
                <div style={styles.playCardContent}>
                  <h3 style={styles.playCardTitle}>{play.title}</h3>
                  <div>
                    <div style={styles.playCardDetail}>
                      <IoCalendarOutline size={14} color="#666" />
                      <span style={styles.playCardDetailText}>
                        {formatDate(play.date)}
                      </span>
                    </div>
                    <div style={styles.playCardDetail}>
                      <IoTimeOutline size={14} color="#666" />
                      <span style={styles.playCardDetailText}>
                        {getTime(play.date)}
                      </span>
                    </div>
                    <div style={styles.playCardDetail}>
                      <IoLocationOutline size={14} color="#666" />
                      <span style={styles.playCardDetailText}>
                        {play.venue || 'Main Theater'}
                      </span>
                    </div>
                  </div>
                  <p style={styles.playCardDescription}>
                    {play.description || 'Experience an amazing theatrical performance'}
                  </p>
                  <div style={styles.playCardFooter}>
                    {play.actors && play.actors.length > 0 && (
                      <div style={styles.actorsContainer}>
                        <IoPeopleOutline size={14} color="#666" />
                        <span style={styles.actorsText}>
                          Starring:{' '}
                          {play.actors
                            .slice(0, 2)
                            .join(', ')
                            .substring(0, 20)}
                          {play.actors.length > 2 ? '...' : ''}
                        </span>
                      </div>
                    )}
                    <button
                      style={styles.bookButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/home/play-details/${play._id}`);
                      }}
                    >
                      <span>Book Now</span>
                      <IoArrowForward size={16} color="#fff" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.emptyContainer}>
            <IoBusiness size={80} color="#e0e0e0" />
            <h3 style={styles.emptyTitle}>No Plays Found</h3>
            <p style={styles.emptyText}>
              {search.trim() !== ''
                ? `No plays match "${search}"`
                : `No ${activeCategory !== 'all' ? activeCategory + ' ' : ''}plays available`}
            </p>
            <button
              style={styles.emptyButton}
              onClick={() => {
                setSearch('');
                setActiveCategory('all');
              }}
            >
              View All Plays
            </button>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div style={styles.quickActions}>
        <div style={styles.quickAction} onClick={() => navigate('/home/my-bookings')}>
          <div style={{ ...styles.quickActionIcon, backgroundColor: '#E8F5E9' }}>
            <IoTicket size={24} color="#4CAF50" />
          </div>
          <span style={styles.quickActionText}>My Tickets</span>
        </div>
        <div style={styles.quickAction} onClick={() => navigate('/home/audience-chat')}>
          <div style={{ ...styles.quickActionIcon, backgroundColor: '#E3F2FD' }}>
            <IoChatbubbles size={24} color="#2196F3" />
          </div>
          <span style={styles.quickActionText}>Live Chat</span>
        </div>
        <div
          style={styles.quickAction}
          onClick={() => navigate('/home/contact')}
        >
          <div style={{ ...styles.quickActionIcon, backgroundColor: '#FFE0B2' }}>
            <IoCall size={24} color="#FF9800" />
          </div>
          <span style={styles.quickActionText}>Contact Us</span>
        </div>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <p style={styles.footerText}>© 2024 Fanaka Arts Theater</p>
        <p style={styles.footerSubText}>Experience the magic of live performance</p>
      </div>
    </div>
  );
}