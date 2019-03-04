// Libraries
import React, {PureComponent} from 'react'

// Components
import {
  Alignment,
  Button,
  ComponentSize,
  ComponentColor,
} from '@influxdata/clockface'
import {IndexList, ComponentSpacer} from 'src/clockface'

// Types
import {Authorization} from '@influxdata/influx'

interface Props {
  auth: Authorization
  onClickDescription: (authID: string) => void
}

export default class TokenRow extends PureComponent<Props> {
  public render() {
    const {description, status, id} = this.props.auth

    return (
      <IndexList.Row>
        <IndexList.Cell>
          <a
            href="#"
            onClick={this.handleClickDescription}
            data-testid={`token-description-${id}`}
          >
            {description}
          </a>
        </IndexList.Cell>
        <IndexList.Cell>{status}</IndexList.Cell>
        <IndexList.Cell alignment={Alignment.Right} revealOnHover={true}>
          <ComponentSpacer align={Alignment.Right}>
            <Button
              size={ComponentSize.ExtraSmall}
              color={ComponentColor.Danger}
              text="Delete"
            />
          </ComponentSpacer>
        </IndexList.Cell>
      </IndexList.Row>
    )
  }

  private handleClickDescription = () => {
    const {onClickDescription, auth} = this.props
    onClickDescription(auth.id)
  }
}
