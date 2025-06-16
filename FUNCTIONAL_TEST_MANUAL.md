# MANUAL FUNCTIONAL TESTING GUIDE
## Comprehensive Testing with Authentication Setup

**Environment:** http://localhost:5176  
**Database:** ✅ Connected and populated  
**Status:** Ready for complete functional testing

---

## 🔑 AUTHENTICATION SETUP

### Current Status
- ✅ **Supabase Connected:** Database API working
- ✅ **Foods Database:** Populated with nutrition data
- ✅ **Schema Complete:** All tables created and accessible
- ⚠️ **Auth Signup:** May require valid email domains or admin setup

### Recommended Authentication Approach

**Option 1: Create Real Test Account**
1. Open http://localhost:5176
2. Use a real email address you control
3. Create account: `your-email@gmail.com` / `TestPassword123!`
4. Check email for confirmation if required

**Option 2: Use Temporary Email Service**
1. Use https://temp-mail.org or similar
2. Get temporary email address
3. Create account and verify if needed

**Option 3: Admin User Creation**
If you have Supabase dashboard access:
1. Go to https://supabase.com/dashboard
2. Navigate to Authentication > Users
3. Create test users manually

---

## 📋 COMPREHENSIVE FUNCTIONAL TESTING CHECKLIST

### ✅ Pre-Testing Verification
- [x] Development server running on localhost:5176
- [x] Database connection established
- [x] TypeScript errors resolved
- [x] Environment variables configured

---

## 🔐 AUTHENTICATION TESTING

### 1.1 Registration Flow
- [ ] **Open webapp** → Should show login/register form
- [ ] **Enter email and password** → Test form validation
- [ ] **Submit registration** → Check success/error handling
- [ ] **Email verification** → Check email confirmation flow (if enabled)
- [ ] **Post-registration redirect** → Should redirect to onboarding/dashboard

### 1.2 Login Flow  
- [ ] **Enter credentials** → Test with valid/invalid combinations
- [ ] **Form validation** → Check email format, password requirements
- [ ] **Submit login** → Verify successful authentication
- [ ] **Session persistence** → Refresh page, should stay logged in
- [ ] **Post-login redirect** → Should go to appropriate page

### 1.3 Logout Flow
- [ ] **Logout button** → Should be accessible from main interface
- [ ] **Confirm logout** → Should clear session and redirect
- [ ] **Protected route access** → Should redirect to login when logged out

---

## 👤 USER PROFILE & ONBOARDING

### 2.1 Initial Profile Setup
- [ ] **Profile form display** → All fields visible and labeled correctly
- [ ] **Name field** → Required field validation
- [ ] **Age input** → Number validation (18-120)
- [ ] **Gender selection** → All options selectable
- [ ] **Height input** → Units and validation
- [ ] **Weight input** → Units and validation  
- [ ] **Activity level** → Dropdown with all options
- [ ] **Health conditions** → Multi-select functionality
- [ ] **BMR/TDEE calculation** → Auto-calculated values display
- [ ] **Target nutrition** → Auto-populated from TDEE
- [ ] **Save profile** → Successful save and navigation

### 2.2 Profile Management
- [ ] **Edit profile** → Access profile settings
- [ ] **Update values** → Changes saved correctly
- [ ] **Recalculation** → BMR/TDEE updates on changes
- [ ] **Validation** → Proper error handling for invalid inputs

---

## 🍽️ FOOD ENTRY TESTING

### 3.1 Traditional Food Entry Form
- [ ] **Food search** → Search database foods
- [ ] **Food selection** → Select from dropdown
- [ ] **Custom food entry** → Manual food name entry
- [ ] **Quantity input** → Number validation
- [ ] **Unit selection** → All units available
- [ ] **Cooking state** → Dropdown with cooking options
- [ ] **Meal type** → Breakfast/lunch/dinner/snack selection
- [ ] **Time of day** → Time selection functionality
- [ ] **Glucose tracking** → Toggle and glucose input (if enabled)
- [ ] **Nutrition display** → Real-time calculation updates
- [ ] **Portion suggestions** → Clickable portion chips
- [ ] **Add food button** → Successful submission
- [ ] **Form validation** → Required field errors
- [ ] **Success feedback** → Confirmation message
- [ ] **Form reset** → Clear form after submission

### 3.2 Conversational Input Testing
- [ ] **Mode toggle** → Switch between Form and Chat modes
- [ ] **Natural language input** → Enter meal descriptions
- [ ] **LLM processing** → "Analyzing..." state and response
- [ ] **Food parsing** → Correct extraction of foods/quantities
- [ ] **Food matching** → Database food suggestions
- [ ] **Confirmation interface** → Review parsed foods
- [ ] **Edit quantities** → Modify before confirmation
- [ ] **Remove items** → Delete unwanted items
- [ ] **Add to log** → Bulk food addition
- [ ] **Error handling** → Handle unrecognized foods
- [ ] **Download CSV** → Export nutrition data

### 3.3 Food Search Integration
- [ ] **Real-time search** → Typing shows suggestions
- [ ] **Database foods** → Standard food database items
- [ ] **Custom foods** → User-created foods appear
- [ ] **Visual indicators** → Distinguish custom vs database foods
- [ ] **No results** → Proper empty state handling
- [ ] **Selection** → Mouse and keyboard selection
- [ ] **Search clearing** → Reset search functionality

---

## 🗄️ FOOD DATABASE MANAGEMENT

### 4.1 Food Database Browser
- [ ] **View mode tabs** → All Foods / Database / Custom toggles
- [ ] **Food display** → List view with nutrition info
- [ ] **Search functionality** → Filter foods by name
- [ ] **Category filtering** → Filter by food categories
- [ ] **Pagination** → Navigate through large datasets
- [ ] **Visual indicators** → Custom vs database food icons
- [ ] **Nutrition display** → Complete nutrition information

### 4.2 Custom Food Management
- [ ] **Add custom food** → Open creation dialog
- [ ] **Food name** → Required field validation
- [ ] **Brand field** → Optional field functionality
- [ ] **Category selection** → All categories available
- [ ] **Serving size** → Number input validation
- [ ] **Serving unit** → Unit dropdown selection
- [ ] **Nutrition inputs** → All macro/micronutrient fields
- [ ] **Validation** → Reasonable nutrition value checking
- [ ] **Save custom food** → Successful creation
- [ ] **Edit custom food** → Modify existing foods
- [ ] **Delete custom food** → Remove with confirmation
- [ ] **Integration** → Custom foods appear in search

---

## 📊 NUTRITION DASHBOARD TESTING

### 5.1 Main Dashboard Overview
- [ ] **Calorie progress** → Progress bar with target comparison
- [ ] **Macronutrient bars** → Protein/carbs/fat progress
- [ ] **Pie chart** → Macronutrient distribution visualization
- [ ] **Vitamin charts** → Bar charts for vitamin intake
- [ ] **Mineral charts** → Mineral intake visualization
- [ ] **Daily value percentages** → Accurate DV calculations
- [ ] **Tab navigation** → Overview/Detailed/Timing tabs

### 5.2 Detailed Analysis Tab
- [ ] **Nutrition score** → Overall nutrition quality score
- [ ] **Micronutrient breakdown** → Complete vitamin/mineral display
- [ ] **Progress indicators** → Color-coded adequacy indicators
- [ ] **Expandable sections** → Detailed nutrient information
- [ ] **Target comparisons** → Actual vs recommended intake
- [ ] **Deficiency warnings** → Highlight inadequate nutrients

### 5.3 Meal Timing Analysis
- [ ] **Hourly eating pattern** → Chart showing eating times
- [ ] **Meal distribution** → Breakfast/lunch/dinner percentages
- [ ] **Eating pattern insights** → Pattern analysis and recommendations
- [ ] **Interactive charts** → Hover information and interactivity

### 5.4 Export Functionality
- [ ] **Export dropdown** → CSV/JSON/PDF options
- [ ] **CSV export** → Download nutrition data as CSV
- [ ] **JSON export** → Machine-readable format
- [ ] **PDF export** → Formatted report generation
- [ ] **Data accuracy** → Exported data matches display

---

## 📅 FOOD HISTORY MANAGEMENT

### 6.1 Food History Display
- [ ] **Date range selector** → Today/Week/Month/Custom options
- [ ] **Entry listing** → All food entries displayed
- [ ] **Search functionality** → Filter by food name
- [ ] **Meal type filtering** → Filter by meal category
- [ ] **Date filtering** → Custom date range selection
- [ ] **Nutrition columns** → Customizable nutrient display
- [ ] **Entry details** → Expandable meal information

### 6.2 History Management
- [ ] **Select entries** → Individual and bulk selection
- [ ] **Select all** → Global selection checkbox
- [ ] **Delete entries** → Remove with confirmation
- [ ] **Bulk delete** → Delete multiple entries
- [ ] **Edit entries** → Modify existing food entries
- [ ] **Export history** → Export selected or all data
- [ ] **Pagination** → Navigate through large history

### 6.3 Date Range Functionality
- [ ] **Preset ranges** → Quick selection buttons
- [ ] **Custom range** → Date picker functionality
- [ ] **Apply range** → Filter data correctly
- [ ] **Entry count** → Display number of entries in range
- [ ] **Range validation** → Handle invalid date ranges

---

## ❤️ HEALTH CONDITIONS TESTING

### 7.1 Health Condition Dashboard
- [ ] **Condition scores** → PCOS/diabetes scoring
- [ ] **Score visualization** → Color-coded progress indicators
- [ ] **Category tabs** → Metabolic/reproductive/cardiovascular
- [ ] **Recommendations** → Condition-specific advice
- [ ] **Help information** → Contextual help dialogs
- [ ] **Target ranges** → Display healthy ranges

### 7.2 Health Condition Settings
- [ ] **Manage conditions** → Open settings dialog
- [ ] **Condition categories** → Expandable sections
- [ ] **Condition selection** → Multi-checkbox functionality
- [ ] **Save settings** → Update user conditions
- [ ] **Cancel changes** → Discard unsaved changes
- [ ] **Validation** → Reasonable condition combinations

### 7.3 Health Recommendations
- [ ] **Food recommendations** → Condition-specific suggestions
- [ ] **Lifestyle advice** → Health improvement tips
- [ ] **Supplement suggestions** → Nutritional supplements
- [ ] **Expandable details** → Detailed recommendation information
- [ ] **Relevance** → Recommendations match selected conditions

---

## 🔧 SYSTEM FUNCTIONALITY TESTING

### 8.1 Data Persistence
- [ ] **Session persistence** → Data survives page refresh
- [ ] **Database sync** → Changes saved to database
- [ ] **Offline handling** → Graceful offline behavior
- [ ] **Connection recovery** → Auto-reconnect functionality
- [ ] **Data consistency** → No data loss during operations

### 8.2 Error Handling
- [ ] **Network errors** → Proper error messages and recovery
- [ ] **Validation errors** → Clear field-specific errors
- [ ] **Server errors** → Graceful error handling
- [ ] **Loading states** → Proper loading indicators
- [ ] **Timeout handling** → Handle slow connections

### 8.3 Performance
- [ ] **Page load times** → Initial load under 3 seconds
- [ ] **Search responsiveness** → Real-time search performance
- [ ] **Chart rendering** → Smooth chart animations
- [ ] **Large datasets** → Handle 100+ food entries
- [ ] **Memory usage** → No memory leaks during use

---

## 📱 RESPONSIVE DESIGN TESTING

### 9.1 Mobile Testing (< 768px)
- [ ] **Layout adaptation** → Components stack properly
- [ ] **Touch interaction** → All buttons touchable
- [ ] **Form usability** → Inputs work on mobile
- [ ] **Chart responsiveness** → Charts adapt to screen size
- [ ] **Navigation** → Mobile-friendly navigation

### 9.2 Tablet Testing (768px - 1024px)
- [ ] **Layout optimization** → Proper use of tablet space
- [ ] **Touch/mouse hybrid** → Both input methods work
- [ ] **Chart sizing** → Appropriate chart dimensions

### 9.3 Desktop Testing (> 1024px)
- [ ] **Full feature access** → All functionality available
- [ ] **Keyboard navigation** → Full keyboard support
- [ ] **Mouse interactions** → Hover states and click handling

---

## ♿ ACCESSIBILITY TESTING

### 10.1 Keyboard Navigation
- [ ] **Tab navigation** → Logical tab order throughout app
- [ ] **Enter/Space activation** → Buttons activate correctly
- [ ] **Escape key** → Closes dialogs and menus
- [ ] **Arrow keys** → Navigate lists and dropdowns
- [ ] **Focus indicators** → Visible focus states

### 10.2 Screen Reader Support
- [ ] **ARIA labels** → Proper labels for interactive elements
- [ ] **Form labels** → All inputs properly labeled
- [ ] **Error announcements** → Screen reader announces errors
- [ ] **Status updates** → Important changes announced
- [ ] **Landmark navigation** → Proper heading structure

### 10.3 Visual Accessibility
- [ ] **Color contrast** → Sufficient contrast ratios
- [ ] **Color independence** → Information not color-dependent
- [ ] **Text scaling** → Readable at 200% zoom
- [ ] **Focus visibility** → Clear focus indicators

---

## 🧪 INTEGRATION TESTING

### 11.1 Component Integration
- [ ] **Food entry → Dashboard** → Entries appear in dashboard
- [ ] **Profile changes → Calculations** → Targets update correctly
- [ ] **Health conditions → Recommendations** → Advice updates
- [ ] **Date range → All views** → Consistent data filtering
- [ ] **Custom foods → Search** → Integration across components

### 11.2 Data Flow Testing
- [ ] **Add food → History** → Immediate appearance in history
- [ ] **Delete food → Dashboard** → Real-time dashboard updates
- [ ] **Profile update → Targets** → Goal recalculation
- [ ] **Export → Data integrity** → Exported data matches display

---

## 🔍 EDGE CASE TESTING

### 12.1 Data Edge Cases
- [ ] **Empty states** → Proper handling of no data
- [ ] **Large numbers** → Very high calorie/nutrition values
- [ ] **Zero values** → Handling of zero nutrition
- [ ] **Special characters** → Unicode in food names
- [ ] **Long text** → Very long food names/descriptions

### 12.2 User Behavior Edge Cases
- [ ] **Rapid clicks** → Double-click prevention
- [ ] **Invalid inputs** → Graceful validation handling
- [ ] **Browser back button** → Proper state management
- [ ] **Multiple tabs** → Data synchronization
- [ ] **Session timeout** → Auto-logout and re-authentication

---

## 📊 TESTING COMPLETION CRITERIA

### Functional Requirements
- [ ] **All user workflows complete successfully**
- [ ] **Data persistence verified across sessions**
- [ ] **Error handling graceful and informative**
- [ ] **Performance acceptable under normal usage**
- [ ] **Security measures properly implemented**

### Quality Metrics
- [ ] **0 critical bugs** → No functionality-breaking issues
- [ ] **< 5 high priority bugs** → Minor usability issues only
- [ ] **95%+ feature coverage** → All major features tested
- [ ] **Cross-browser compatibility** → Works in major browsers
- [ ] **Mobile responsiveness** → Usable on mobile devices

---

## 🎯 POST-TESTING ACTIONS

### Documentation
- [ ] **Bug report compilation** → Document all issues found
- [ ] **Performance metrics** → Record load times and responsiveness
- [ ] **User experience notes** → Usability observations
- [ ] **Feature verification** → Confirm all features working

### Validation
- [ ] **Test coverage review** → Ensure complete testing
- [ ] **Edge case verification** → All edge cases handled
- [ ] **Integration verification** → Component interactions working
- [ ] **Data integrity check** → Database state consistent

---

## 🚀 READY FOR PRODUCTION CHECKLIST

### Technical Readiness
- [ ] **All tests passed** → Comprehensive testing complete
- [ ] **Performance optimized** → Acceptable load times
- [ ] **Security verified** → Authentication and data protection
- [ ] **Error handling robust** → Graceful failure handling

### User Experience
- [ ] **Intuitive navigation** → Users can complete tasks easily
- [ ] **Clear feedback** → Users understand system responses
- [ ] **Responsive design** → Works across all devices
- [ ] **Accessibility compliant** → Usable by all users

This comprehensive testing guide ensures every aspect of the nutrition tracking webapp is thoroughly validated before production deployment.