// Libraries
import React, {PureComponent} from 'react'
import {connect} from 'react-redux'

// Components
import FluxEditor from 'src/shared/components/FluxEditor'
import Threesizer from 'src/shared/components/threesizer/Threesizer'
import FluxFunctionsToolbar from 'src/timeMachine/components/fluxFunctionsToolbar/FluxFunctionsToolbar'
import VariablesToolbar from 'src/timeMachine/components/variableToolbar/VariableToolbar'
import ToolbarTab from 'src/timeMachine/components/ToolbarTab'

// Actions
import {
  setActiveQueryText,
  submitScript,
  setActiveQueryEdited,
} from 'src/timeMachine/actions'

// Utils
import {getActiveQuery} from 'src/timeMachine/selectors'

// Constants
import {HANDLE_VERTICAL, HANDLE_NONE} from 'src/shared/constants'

// Types
import {AppState} from 'src/types/v2'

// Styles
import 'src/timeMachine/components/TimeMachineFluxEditor.scss'

interface StateProps {
  activeQueryText: string
}

interface DispatchProps {
  onSetActiveQueryText: typeof setActiveQueryText
  onSubmitScript: typeof submitScript
  onSetActiveQueryEdited: typeof setActiveQueryEdited
}

interface State {
  displayFluxFunctions: boolean
}

type Props = StateProps & DispatchProps

class TimeMachineFluxEditor extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      displayFluxFunctions: true,
    }
  }

  public componentDidMount() {
    this.props.onSetActiveQueryEdited(false)
  }

  public componentWillUnmount() {
    this.props.onSetActiveQueryEdited(false)
  }

  public render() {
    const {activeQueryText, onSubmitScript} = this.props

    const divisions = [
      {
        size: 0.75,
        handleDisplay: HANDLE_NONE,
        render: () => (
          <FluxEditor
            script={activeQueryText}
            status={{type: '', text: ''}}
            onChangeScript={this.handleChangeScript}
            onSubmitScript={onSubmitScript}
            suggestions={[]}
          />
        ),
      },
      {
        render: () => {
          return (
            <>
              <div className="toolbar-tab-container">
                <ToolbarTab
                  onSetActive={this.hideFluxFunctions}
                  name="Variables"
                  active={!this.state.displayFluxFunctions}
                />
                <ToolbarTab
                  onSetActive={this.showFluxFunctions}
                  name="Functions"
                  active={this.state.displayFluxFunctions}
                  testID="functions-toolbar-tab"
                />
              </div>
              {this.rightDivision}
            </>
          )
        },
        handlePixels: 6,
        size: 0.25,
      },
    ]

    return (
      <div className="time-machine-flux-editor">
        <Threesizer orientation={HANDLE_VERTICAL} divisions={divisions} />
      </div>
    )
  }

  private handleChangeScript = (script: string) => {
    const {onSetActiveQueryText} = this.props
    onSetActiveQueryText(script)

    this.props.onSetActiveQueryEdited(true)
  }

  private get rightDivision(): JSX.Element {
    const {displayFluxFunctions} = this.state

    if (displayFluxFunctions) {
      return <FluxFunctionsToolbar />
    }

    return <VariablesToolbar />
  }

  private showFluxFunctions = () => {
    this.setState({displayFluxFunctions: true})
  }

  private hideFluxFunctions = () => {
    this.setState({displayFluxFunctions: false})
  }
}

const mstp = (state: AppState) => {
  const activeQueryText = getActiveQuery(state).text

  return {activeQueryText}
}

const mdtp = {
  onSetActiveQueryText: setActiveQueryText,
  onSubmitScript: submitScript,
  onSetActiveQueryEdited: setActiveQueryEdited,
}

export default connect<StateProps, DispatchProps, {}>(
  mstp,
  mdtp
)(TimeMachineFluxEditor)
