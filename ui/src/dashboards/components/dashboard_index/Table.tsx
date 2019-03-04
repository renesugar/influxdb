// Libraries
import React, {PureComponent} from 'react'
import {withRouter, WithRouterProps} from 'react-router'
import _ from 'lodash'

// Components
import {
  Button,
  IconFont,
  ComponentSize,
  ComponentColor,
} from '@influxdata/clockface'
import {EmptyState, ResourceList} from 'src/clockface'
import DashboardCards from 'src/dashboards/components/dashboard_index/DashboardCards'
import SortingHat from 'src/shared/components/sorting_hat/SortingHat'

// Types
import {Sort} from 'src/clockface'
import {Dashboard, Organization} from 'src/types/v2'

interface Props {
  searchTerm: string
  dashboards: Dashboard[]
  defaultDashboardLink: string
  onDeleteDashboard: (dashboard: Dashboard) => void
  onCreateDashboard: () => void
  onCloneDashboard: (dashboard: Dashboard) => void
  onExportDashboard: (dashboard: Dashboard) => void
  onUpdateDashboard: (dashboard: Dashboard) => void
  onSetDefaultDashboard: (dashboardLink: string) => void
  onEditLabels: (dashboard: Dashboard) => void
  onFilterChange: (searchTerm: string) => void
  orgs: Organization[]
  showOwnerColumn: boolean
  filterComponent?: () => JSX.Element
}

interface DatedDashboard extends Dashboard {
  modified: Date
}

interface State {
  sortKey: SortKey
  sortDirection: Sort
}

type SortKey = keyof Dashboard | 'modified' | 'owner' | 'default' // owner and modified are currently hardcoded

class DashboardsTable extends PureComponent<Props & WithRouterProps, State> {
  constructor(props) {
    super(props)
    this.state = {
      sortKey: null,
      sortDirection: Sort.Descending,
    }
  }

  public render() {
    const {filterComponent} = this.props
    const {sortKey, sortDirection} = this.state

    return (
      <ResourceList>
        <ResourceList.Header filterComponent={filterComponent}>
          <ResourceList.Sorter
            name={this.headerKeys[0]}
            sortKey={this.headerKeys[0]}
            sort={sortKey === this.headerKeys[0] ? sortDirection : Sort.None}
            onClick={this.handleClickColumn}
          />
          {this.ownerSorter}
          <ResourceList.Sorter
            name={this.headerKeys[2]}
            sortKey={this.headerKeys[2]}
            sort={sortKey === this.headerKeys[2] ? sortDirection : Sort.None}
            onClick={this.handleClickColumn}
          />
        </ResourceList.Header>
        <ResourceList.Body emptyState={this.emptyState}>
          {this.sortedCards}
        </ResourceList.Body>
      </ResourceList>
    )
  }

  private get headerKeys(): SortKey[] {
    return ['name', 'owner', 'modified', 'default']
  }

  private get ownerSorter(): JSX.Element {
    const {showOwnerColumn} = this.props
    const {sortKey, sortDirection} = this.state

    if (showOwnerColumn) {
      return (
        <ResourceList.Sorter
          name={this.headerKeys[1]}
          sortKey={this.headerKeys[1]}
          sort={sortKey === this.headerKeys[1] ? sortDirection : Sort.None}
          onClick={this.handleClickColumn}
        />
      )
    }
  }

  private handleClickColumn = (nextSort: Sort, sortKey: SortKey) => {
    this.setState({sortKey, sortDirection: nextSort})
  }

  private get sortedCards(): JSX.Element {
    const {
      dashboards,
      onExportDashboard,
      onCloneDashboard,
      onDeleteDashboard,
      onUpdateDashboard,
      onEditLabels,
      orgs,
      showOwnerColumn,
      onFilterChange,
    } = this.props

    const {sortKey, sortDirection} = this.state

    if (dashboards.length) {
      return (
        <SortingHat<DatedDashboard>
          list={this.datedDashboards}
          sortKey={sortKey}
          direction={sortDirection}
        >
          {ds => (
            <DashboardCards
              dashboards={ds}
              onCloneDashboard={onCloneDashboard}
              onExportDashboard={onExportDashboard}
              onDeleteDashboard={onDeleteDashboard}
              onUpdateDashboard={onUpdateDashboard}
              onEditLabels={onEditLabels}
              orgs={orgs}
              showOwnerColumn={showOwnerColumn}
              onFilterChange={onFilterChange}
            />
          )}
        </SortingHat>
      )
    }

    return null
  }

  private get datedDashboards(): DatedDashboard[] {
    return this.props.dashboards.map(d => ({
      ...d,
      modified: new Date(d.meta.updatedAt),
    }))
  }

  private get emptyState(): JSX.Element {
    const {onCreateDashboard, searchTerm} = this.props

    if (searchTerm) {
      return (
        <EmptyState size={ComponentSize.Large}>
          <EmptyState.Text text="No Dashboards match your search term" />
        </EmptyState>
      )
    }

    return (
      <EmptyState size={ComponentSize.Large}>
        <EmptyState.Text
          text="Looks like you don’t have any Dashboards , why not create one?"
          highlightWords={['Dashboards']}
        />
        <Button
          text="Create a Dashboard"
          icon={IconFont.Plus}
          color={ComponentColor.Primary}
          onClick={onCreateDashboard}
          size={ComponentSize.Medium}
        />
      </EmptyState>
    )
  }
}

export default withRouter<Props>(DashboardsTable)
