// Libraries
import _ from 'lodash'
import React, {PureComponent, ChangeEvent} from 'react'

// APIs
import {client} from 'src/utils/api'

// Components
import ScraperList from 'src/organizations/components/ScraperList'
import {
  Button,
  ComponentColor,
  IconFont,
  ComponentSize,
} from '@influxdata/clockface'
import {EmptyState, Input, InputType, Tabs} from 'src/clockface'
import DataLoadersWizard from 'src/dataLoaders/components/DataLoadersWizard'

// Actions
import * as NotificationsActions from 'src/types/actions/notifications'

// Decorators
import {ErrorHandling} from 'src/shared/decorators/errors'

// Types
import {ScraperTargetResponse, Bucket} from '@influxdata/influx'
import {OverlayState} from 'src/types'
import {DataLoaderType, DataLoaderStep} from 'src/types/v2/dataLoaders'
import {
  scraperDeleteSuccess,
  scraperDeleteFailed,
  scraperUpdateSuccess,
  scraperUpdateFailed,
} from 'src/shared/copy/v2/notifications'
import FilterList from 'src/shared/components/Filter'

interface Props {
  scrapers: ScraperTargetResponse[]
  onChange: () => void
  orgName: string
  buckets: Bucket[]
  notify: NotificationsActions.PublishNotificationActionCreator
}

interface State {
  overlayState: OverlayState
  searchTerm: string
}

@ErrorHandling
export default class Scrapers extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      overlayState: OverlayState.Closed,
      searchTerm: '',
    }
  }

  public render() {
    const {searchTerm} = this.state
    const {scrapers} = this.props

    return (
      <>
        <Tabs.TabContentsHeader>
          <Input
            icon={IconFont.Search}
            placeholder="Filter scrapers..."
            widthPixels={290}
            value={searchTerm}
            type={InputType.Text}
            onChange={this.handleFilterChange}
            onBlur={this.handleFilterBlur}
          />
          {this.createScraperButton}
        </Tabs.TabContentsHeader>
        <FilterList<ScraperTargetResponse>
          searchTerm={searchTerm}
          searchKeys={['name', 'url']}
          list={scrapers}
        >
          {sl => (
            <ScraperList
              scrapers={sl}
              emptyState={this.emptyState}
              onDeleteScraper={this.handleDeleteScraper}
              onUpdateScraper={this.handleUpdateScraper}
            />
          )}
        </FilterList>
        <DataLoadersWizard
          visible={this.isOverlayVisible}
          onCompleteSetup={this.handleDismissDataLoaders}
          startingType={DataLoaderType.Scraping}
          startingStep={DataLoaderStep.Configure}
          buckets={this.buckets}
        />
      </>
    )
  }

  private get buckets(): Bucket[] {
    const {buckets} = this.props

    if (!buckets || !buckets.length) {
      return []
    }
    return buckets
  }

  private get isOverlayVisible(): boolean {
    return this.state.overlayState === OverlayState.Open
  }

  private get createScraperButton(): JSX.Element {
    return (
      <Button
        text="Create Scraper"
        icon={IconFont.Plus}
        color={ComponentColor.Primary}
        onClick={this.handleAddScraper}
      />
    )
  }

  private handleAddScraper = () => {
    this.setState({overlayState: OverlayState.Open})
  }

  private handleDismissDataLoaders = () => {
    this.setState({overlayState: OverlayState.Closed})
    this.props.onChange()
  }

  private get emptyState(): JSX.Element {
    const {orgName} = this.props
    const {searchTerm} = this.state

    if (_.isEmpty(searchTerm)) {
      return (
        <EmptyState size={ComponentSize.Medium}>
          <EmptyState.Text
            text={`${orgName} does not own any Scrapers, why not create one?`}
            highlightWords={['Scrapers']}
          />
          {this.createScraperButton}
        </EmptyState>
      )
    }

    return (
      <EmptyState size={ComponentSize.Medium}>
        <EmptyState.Text text="No Scraper buckets match your query" />
      </EmptyState>
    )
  }

  private handleUpdateScraper = async (scraper: ScraperTargetResponse) => {
    const {onChange, notify} = this.props
    try {
      await client.scrapers.update(scraper.id, scraper)
      onChange()
      notify(scraperUpdateSuccess(scraper.name))
    } catch (e) {
      console.error(e)
      notify(scraperUpdateFailed(scraper.name))
    }
  }

  private handleDeleteScraper = async (scraper: ScraperTargetResponse) => {
    const {onChange, notify} = this.props
    try {
      await client.scrapers.delete(scraper.id)
      onChange()
      notify(scraperDeleteSuccess(scraper.name))
    } catch (e) {
      notify(scraperDeleteFailed(scraper.name))
      console.error(e)
    }
  }

  private handleFilterChange = (e: ChangeEvent<HTMLInputElement>): void => {
    this.setState({searchTerm: e.target.value})
  }

  private handleFilterBlur = (e: ChangeEvent<HTMLInputElement>): void => {
    this.setState({searchTerm: e.target.value})
  }
}
