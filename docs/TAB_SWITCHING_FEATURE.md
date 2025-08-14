# Tab Switching Auto-Submit Feature

## Overview
The online internship platform now includes an enhanced anti-cheating feature that automatically submits tests after 3 tab switches. This feature helps maintain test integrity by preventing students from accessing external resources during assessments.

## How It Works

### Tab Switch Detection
- The system monitors the `visibilitychange` event to detect when users switch away from the test tab
- Each tab switch increments a counter
- After exactly 3 tab switches, the test is automatically submitted

### User Experience

#### Visual Indicators
1. **Initial Warning**: A subtle warning appears in the header: "⚠️ Test will auto-submit after 3 tab switches"
2. **Tab Switch Counter**: After the first tab switch, a red counter appears showing "Tab Switches: X/3"
3. **Remaining Switches Warning**: When 1-2 switches remain, an animated warning shows: "⚠️ X tab switch(es) remaining!"
4. **Final Warning Modal**: After 2 tab switches, a modal appears with a final warning

#### Warning Messages
- **1st Tab Switch**: "Warning: Tab switching detected! (1/3)"
- **2nd Tab Switch**: "Warning: Tab switching detected! (2/3)" + Final warning modal
- **3rd Tab Switch**: "Test automatically submitted due to 3 tab switches!" + Auto-submit

### Technical Implementation

#### TestContext.js
- Added `tabSwitches` state to track tab switch count
- Added `ADD_TAB_SWITCH` reducer action
- Added `addTabSwitch()` function that handles counting and auto-submission
- Tab switch count is included in test results

#### TestInterface.js
- Uses `addTabSwitch()` from context instead of local state
- Shows visual indicators for tab switch count
- Displays warning modals at appropriate times
- Auto-navigates to results after 3rd tab switch

#### TestResults.js
- Displays tab switch count in results summary
- Shows special indicator if test was auto-submitted due to tab switches
- Includes tab switches in the detailed results

## Configuration

### Current Settings
- **Maximum Tab Switches**: 3
- **Auto-submit**: Enabled after 3rd tab switch
- **Warning Display**: Progressive warnings at 1st, 2nd, and 3rd switches

### Customization
To modify the maximum number of tab switches, update the following files:
1. `src/contexts/TestContext.js` - Change the condition in `addTabSwitch()`
2. `src/components/test/TestInterface.js` - Update warning messages and conditions
3. `src/components/test/TestResults.js` - Update display logic

## Security Features

### Additional Anti-Cheating Measures
- Right-click disabled
- Keyboard shortcuts blocked
- Developer tools detection
- Inactivity monitoring
- Text selection disabled
- Screenshot prevention

### Integration
The tab switching feature works alongside existing anti-cheating measures:
- Tab switches are tracked separately from general warnings
- Both systems can trigger auto-submission independently
- Results include both warning counts and tab switch counts

## User Guidelines

### For Students
- Stay on the test tab throughout the assessment
- Avoid switching to other applications or tabs
- The system provides clear warnings before auto-submission
- Test progress is auto-saved every 30 seconds

### For Administrators
- Monitor tab switch counts in test results
- Review cases where tests were auto-submitted
- Consider tab switch patterns when evaluating test integrity

## Testing the Feature

### Manual Testing
1. Start a test
2. Switch tabs 3 times
3. Verify auto-submission occurs
4. Check results show tab switch count
5. Verify warning messages appear correctly

### Edge Cases
- Browser refresh during test
- Browser crash/recovery
- Multiple monitors
- Mobile device testing

## Admin Dashboard Integration

### Overview
The admin dashboard now includes comprehensive reporting and monitoring features for tab switching violations and other security measures.

### Admin Features

#### 1. Overview Dashboard
- **Security Statistics**: Total tab switches, warnings, and auto-submitted tests
- **Visual Indicators**: Color-coded cards showing violation counts
- **Quick Insights**: Overview of clean vs. violated tests

#### 2. Test Reports Tab
- **Security Violations Overview**: Summary cards for different violation types
- **Detailed Test Reports Table**: Complete list with tab switch and warning data
- **Export Functionality**: Download reports in CSV, Excel, or JSON formats
- **Violation Analysis**: Breakdown of tab switches and warnings by severity

#### 3. Individual Candidate Reports
- **Detailed Modal**: Click eye icon to view comprehensive candidate report
- **Security Analysis**: Tab switch and warning activity breakdown
- **Performance Metrics**: Score, time taken, and test status
- **Auto-Submission Status**: Clear indication if test was auto-submitted

#### 4. Candidate Cards Enhancement
- **Security Information**: Tab switches and warnings displayed on candidate cards
- **Color-Coded Indicators**: Green for clean, orange for warnings, red for violations
- **Auto-Submission Badge**: Special indicator for auto-submitted tests

### Admin Capabilities

#### Monitoring
- Real-time tracking of all candidate test activities
- Comprehensive violation reporting
- Historical data analysis
- Pattern recognition for suspicious behavior

#### Reporting
- Export detailed reports for compliance
- Individual candidate analysis
- Batch processing of test results
- Custom report generation

#### Security Management
- Review and validate auto-submissions
- Investigate suspicious activity patterns
- Adjust security parameters if needed
- Maintain audit trails

## Future Enhancements

### Potential Improvements
- Configurable tab switch limits per test
- Different consequences for different violation types
- Enhanced detection of virtual desktops
- Integration with proctoring software
- Analytics dashboard for violation patterns
- Real-time alerts for security violations
- Advanced fraud detection algorithms
- Integration with learning management systems 