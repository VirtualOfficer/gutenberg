import {
  Image,
  StyleSheet,
  Text,
	TouchableWithoutFeedback,
	PanResponder,
	View,
	Dimensions
} from 'react-native';
import Modal from 'react-native-modal';
import ReanimatedBottomSheet from 'reanimated-bottom-sheet';
import { Component } from '@wordpress/element';
import { withPreferredColorScheme } from '@wordpress/compose';

import Button from './button';
import Cell from './cell';
import PickerCell from './picker-cell';
import SwitchCell from './switch-cell';
import RangeCell from './range-cell';
import KeyboardAvoidingView from './keyboard-avoiding-view';
class BottomSheet extends Component {
  renderInner = () => (
    <View style={styles.panel}>
      {this.props.children}
    </View>
  );

  renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.panelHeader}>
        <View style={styles.panelHandle} />
      </View>
    </View>
  );

  render() {
		const panResponder = PanResponder.create( {
			onMoveShouldSetPanResponder: ( evt, gestureState ) => {
				// Activates swipe down over child Touchables if the swipe is long enough.
				// With this we can adjust sensibility on the swipe vs tap gestures.
				if ( gestureState.dy > 3 ) {
					gestureState.dy = 0;
					return true;
				}
			},
		} );
    return (
			<Modal isVisible={ this.props.isVisible } onBackdropPress={ this.props.onClose } style={{margin: 0}}
			onMoveShouldSetResponder={ panResponder.panHandlers.onMoveShouldSetResponder }
				onMoveShouldSetResponderCapture={ panResponder.panHandlers.onMoveShouldSetResponderCapture }
			>
        <ReanimatedBottomSheet
          snapPoints={[500, 0]}
          renderContent={this.renderInner}
          renderHeader={this.renderHeader}
					onCloseEnd={this.props.onClose}
        />
			</Modal>

    );
  }
}

function getWidth() {
	return Math.min( Dimensions.get( 'window' ).width, 512 );
}

const ThemedBottomSheet = withPreferredColorScheme( BottomSheet );

ThemedBottomSheet.getWidth = getWidth;
ThemedBottomSheet.Button = Button;
ThemedBottomSheet.Cell = Cell;
ThemedBottomSheet.PickerCell = PickerCell;
ThemedBottomSheet.SwitchCell = SwitchCell;
ThemedBottomSheet.RangeCell = RangeCell;

export default ThemedBottomSheet;

const IMAGE_SIZE = 200;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  box: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
  },
  panelContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  panel: {
    height: 600,
		backgroundColor: '#f7f5eee8',
  },
  header: {
    backgroundColor: '#f7f5eee8',
    shadowColor: '#000000',
    paddingTop: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  panelHeader: {
    alignItems: 'center',
  },
  panelHandle: {
    width: 40,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00000040',
    marginBottom: 10,
  },
  panelTitle: {
    fontSize: 27,
    height: 35,
  },
  panelSubtitle: {
    fontSize: 14,
    color: 'gray',
    height: 30,
    marginBottom: 10,
  },
  panelButton: {
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#318bfb',
    alignItems: 'center',
    marginVertical: 10,
  },
  panelButtonTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: 'white',
  },
  photo: {
    width: '100%',
    height: 225,
    marginTop: 30,
  },
  map: {
    height: '100%',
    width: '100%',
  },
});
