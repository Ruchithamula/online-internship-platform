import React, { useState, useEffect } from 'react';
import { 
  FaChartLine, 
  FaUsers, 
  FaTrophy, 
  FaExclamationTriangle,
  FaCalendarAlt,
  FaClock,
  FaDownload,
  FaFilter
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const AnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalCandidates: 0,
      totalTests: 0,
      passRate: 0,
      averageScore: 0,
      revenue: 0,
      activeTests: 0
    },
    trends: {
      dailyRegistrations: [],
      dailyTests: [],
      dailyRevenue: [],
      passRateTrend: []
    },
    demographics: {
      colleges: [],
      locations: [],
      ageGroups: []
    },
    performance: {
      scoreDistribution: [],
      timeAnalysis: [],
      questionAnalysis: []
    },
    security: {
      violations: [],
      warnings: [],
      autoSubmissions: []
    }
  });
  
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('overview');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`http://localhost:5000/api/admin/analytics?range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      } else {
        // Fallback to mock data for demo
        setAnalyticsData(generateMockAnalyticsData());
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setAnalyticsData(generateMockAnalyticsData());
    } finally {
      setLoading(false);
    }
  };

  const generateMockAnalyticsData = () => ({
    overview: {
      totalCandidates: 156,
      totalTests: 203,
      passRate: 68.5,
      averageScore: 72.3,
      revenue: 45985,
      activeTests: 12
    },
    trends: {
      dailyRegistrations: generateMockTrendData(30, 2, 8),
      dailyTests: generateMockTrendData(30, 5, 15),
      dailyRevenue: generateMockTrendData(30, 1000, 3000),
      passRateTrend: generateMockTrendData(30, 60, 80)
    },
    demographics: {
      colleges: [
        { name: 'IIT Delhi', count: 25, percentage: 16 },
        { name: 'BITS Pilani', count: 18, percentage: 11.5 },
        { name: 'NIT Trichy', count: 15, percentage: 9.6 },
        { name: 'Other Colleges', count: 98, percentage: 62.9 }
      ],
      locations: [
        { name: 'Delhi', count: 35, percentage: 22.4 },
        { name: 'Mumbai', count: 28, percentage: 17.9 },
        { name: 'Bangalore', count: 25, percentage: 16 },
        { name: 'Other Cities', count: 68, percentage: 43.7 }
      ],
      ageGroups: [
        { name: '18-20', count: 45, percentage: 28.8 },
        { name: '21-23', count: 78, percentage: 50 },
        { name: '24-26', count: 33, percentage: 21.2 }
      ]
    },
    performance: {
      scoreDistribution: [
        { range: '90-100%', count: 12, percentage: 7.7 },
        { range: '80-89%', count: 28, percentage: 17.9 },
        { range: '70-79%', count: 45, percentage: 28.8 },
        { range: '60-69%', count: 38, percentage: 24.4 },
        { range: '50-59%', count: 20, percentage: 12.8 },
        { range: 'Below 50%', count: 13, percentage: 8.4 }
      ],
      timeAnalysis: [
        { range: '0-10 min', count: 15, percentage: 9.6 },
        { range: '11-20 min', count: 45, percentage: 28.8 },
        { range: '21-30 min', count: 96, percentage: 61.6 }
      ],
      questionAnalysis: [
        { category: 'HTML', avgScore: 78.5, difficulty: 'Easy' },
        { category: 'CSS', avgScore: 72.3, difficulty: 'Moderate' },
        { category: 'JavaScript', avgScore: 65.8, difficulty: 'Hard' },
        { category: 'React', avgScore: 58.2, difficulty: 'Expert' }
      ]
    },
    security: {
      violations: [
        { type: 'Tab Switches', count: 23, percentage: 14.7 },
        { type: 'Multiple Windows', count: 8, percentage: 5.1 },
        { type: 'Copy-Paste', count: 5, percentage: 3.2 },
        { type: 'Screen Recording', count: 2, percentage: 1.3 }
      ],
      warnings: [
        { level: 'Level 1', count: 15, percentage: 9.6 },
        { level: 'Level 2', count: 8, percentage: 5.1 },
        { level: 'Level 3', count: 3, percentage: 1.9 }
      ],
      autoSubmissions: [
        { reason: '3 Tab Switches', count: 12, percentage: 7.7 },
        { reason: '3 Warnings', count: 5, percentage: 3.2 },
        { reason: 'Time Expired', count: 8, percentage: 5.1 }
      ]
    }
  });

  const generateMockTrendData = (days, min, max) => {
    return Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: Math.floor(Math.random() * (max - min + 1)) + min
    }));
  };

  const handleExportAnalytics = async (format) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/admin/analytics/export?format=${format}&range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success(`Analytics exported as ${format.toUpperCase()}`);
      } else {
        toast.error('Failed to export analytics');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export analytics');
    }
  };

  const renderOverviewCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <div className="card text-center">
        <FaUsers className="text-3xl text-blue-500 mx-auto mb-3" />
        <h3 className="text-2xl font-bold text-primary-dark">{analyticsData.overview.totalCandidates}</h3>
        <p className="text-gray-600">Total Candidates</p>
        <div className="mt-2 text-sm text-green-600">
          +12% from last month
        </div>
      </div>
      
      <div className="card text-center">
        <FaChartLine className="text-3xl text-green-500 mx-auto mb-3" />
        <h3 className="text-2xl font-bold text-primary-dark">{analyticsData.overview.passRate}%</h3>
        <p className="text-gray-600">Pass Rate</p>
        <div className="mt-2 text-sm text-green-600">
          +5.2% from last month
        </div>
      </div>
      
      <div className="card text-center">
        <FaTrophy className="text-3xl text-yellow-500 mx-auto mb-3" />
        <h3 className="text-2xl font-bold text-primary-dark">₹{analyticsData.overview.revenue.toLocaleString()}</h3>
        <p className="text-gray-600">Total Revenue</p>
        <div className="mt-2 text-sm text-green-600">
          +18% from last month
        </div>
      </div>
      
      <div className="card text-center">
        <FaClock className="text-3xl text-purple-500 mx-auto mb-3" />
        <h3 className="text-2xl font-bold text-primary-dark">{analyticsData.overview.activeTests}</h3>
        <p className="text-gray-600">Active Tests</p>
        <div className="mt-2 text-sm text-blue-600">
          Currently running
        </div>
      </div>
      
      <div className="card text-center">
        <FaExclamationTriangle className="text-3xl text-red-500 mx-auto mb-3" />
        <h3 className="text-2xl font-bold text-primary-dark">{analyticsData.security.violations.reduce((sum, v) => sum + v.count, 0)}</h3>
        <p className="text-gray-600">Security Violations</p>
        <div className="mt-2 text-sm text-red-600">
          -8% from last month
        </div>
      </div>
      
      <div className="card text-center">
        <FaCalendarAlt className="text-3xl text-indigo-500 mx-auto mb-3" />
        <h3 className="text-2xl font-bold text-primary-dark">{analyticsData.overview.averageScore}%</h3>
        <p className="text-gray-600">Average Score</p>
        <div className="mt-2 text-sm text-green-600">
          +2.1% from last month
        </div>
      </div>
    </div>
  );

  const renderTrendChart = (data, title, color = 'blue') => (
    <div className="card">
      <h3 className="text-lg font-semibold text-primary-dark mb-4">{title}</h3>
      <div className="h-64 flex items-end justify-between space-x-1">
        {data.slice(-7).map((item, index) => {
          const maxValue = Math.max(...data.map(d => d.value));
          const height = (item.value / maxValue) * 100;
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className={`w-full bg-${color}-500 rounded-t transition-all duration-300 hover:bg-${color}-600`}
                style={{ height: `${height}%` }}
                title={`${item.date}: ${item.value}`}
              ></div>
              <span className="text-xs text-gray-600 mt-1">{item.date.split('-')[2]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderDemographics = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="card">
        <h3 className="text-lg font-semibold text-primary-dark mb-4">Top Colleges</h3>
        <div className="space-y-3">
          {analyticsData.demographics.colleges.map((college, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">{college.name}</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${college.percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600">{college.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="card">
        <h3 className="text-lg font-semibold text-primary-dark mb-4">Geographic Distribution</h3>
        <div className="space-y-3">
          {analyticsData.demographics.locations.map((location, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">{location.name}</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${location.percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600">{location.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="card">
        <h3 className="text-lg font-semibold text-primary-dark mb-4">Age Distribution</h3>
        <div className="space-y-3">
          {analyticsData.demographics.ageGroups.map((ageGroup, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">{ageGroup.name} years</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full" 
                    style={{ width: `${ageGroup.percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600">{ageGroup.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPerformanceAnalysis = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card">
        <h3 className="text-lg font-semibold text-primary-dark mb-4">Score Distribution</h3>
        <div className="space-y-3">
          {analyticsData.performance.scoreDistribution.map((score, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">{score.range}</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      score.range.includes('90-100') ? 'bg-green-500' :
                      score.range.includes('80-89') ? 'bg-blue-500' :
                      score.range.includes('70-79') ? 'bg-yellow-500' :
                      score.range.includes('60-69') ? 'bg-orange-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${score.percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600">{score.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="card">
        <h3 className="text-lg font-semibold text-primary-dark mb-4">Question Category Performance</h3>
        <div className="space-y-4">
          {analyticsData.performance.questionAnalysis.map((category, index) => (
            <div key={index} className="border-b border-gray-200 pb-3 last:border-b-0">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-700">{category.category}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  category.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                  category.difficulty === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                  category.difficulty === 'Hard' ? 'bg-orange-100 text-orange-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {category.difficulty}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    className={`h-2 rounded-full ${
                      category.avgScore >= 80 ? 'bg-green-500' :
                      category.avgScore >= 70 ? 'bg-blue-500' :
                      category.avgScore >= 60 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${category.avgScore}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-600">{category.avgScore}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSecurityAnalysis = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="card">
        <h3 className="text-lg font-semibold text-primary-dark mb-4">Security Violations</h3>
        <div className="space-y-3">
          {analyticsData.security.violations.map((violation, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">{violation.type}</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full" 
                    style={{ width: `${violation.percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600">{violation.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="card">
        <h3 className="text-lg font-semibold text-primary-dark mb-4">Warning Levels</h3>
        <div className="space-y-3">
          {analyticsData.security.warnings.map((warning, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">{warning.level}</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full" 
                    style={{ width: `${warning.percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600">{warning.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="card">
        <h3 className="text-lg font-semibold text-primary-dark mb-4">Auto-Submissions</h3>
        <div className="space-y-3">
          {analyticsData.security.autoSubmissions.map((submission, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">{submission.reason}</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full" 
                    style={{ width: `${submission.percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600">{submission.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-light-bg flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-primary-dark">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-primary-dark">Analytics Dashboard</h1>
              <p className="text-sm text-gray-600">Comprehensive insights and performance metrics</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FaFilter className="text-gray-400" />
                <select 
                  value={timeRange} 
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last year</option>
                </select>
              </div>
              <button
                onClick={() => handleExportAnalytics('csv')}
                className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <FaDownload />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        {renderOverviewCards()}

        {/* Trend Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {renderTrendChart(analyticsData.trends.dailyRegistrations, 'Daily Registrations', 'blue')}
          {renderTrendChart(analyticsData.trends.dailyTests, 'Daily Tests Completed', 'green')}
          {renderTrendChart(analyticsData.trends.dailyRevenue, 'Daily Revenue (₹)', 'yellow')}
          {renderTrendChart(analyticsData.trends.passRateTrend, 'Pass Rate Trend (%)', 'purple')}
        </div>

        {/* Demographics */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-primary-dark mb-6">Demographics Analysis</h2>
          {renderDemographics()}
        </div>

        {/* Performance Analysis */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-primary-dark mb-6">Performance Analysis</h2>
          {renderPerformanceAnalysis()}
        </div>

        {/* Security Analysis */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-primary-dark mb-6">Security Analysis</h2>
          {renderSecurityAnalysis()}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard; 