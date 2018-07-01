import React, { Component } from 'react'
import { forEach } from 'lodash'
import { Panel, Button, ToggleButton, ToggleButtonGroup } from 'react-bootstrap'
import SheetItems from './moonsheet/SheetItems'
import FilterPanel from './moonsheet/FilterPanel'
import { getMoonmatPrices } from '../lib/api'

const reactions = require('./reactions.json')


class MoonSheet extends Component {

  state = {
    prices: null,
    list_type: 'full',
    refinery_type: 'athanor',
    efficiency: true,
    hundredRuns: false,
  }

  componentDidMount() {
    if (this.state.hundredRuns) {
      this.makeHundredRuns()
    }

    getMoonmatPrices().then(({ data }) => {
      // console.log('data:', data)
      const buy = {}
      const sell = {}
      data.forEach(item => {
        const typeId = item.buy.forQuery.types[0]
        // buy[typeId] = item.buy.max
        // sell[typeId] = item.sell.min
        buy[typeId] = item.buy.fivePercent
        sell[typeId] = item.sell.fivePercent
        if (!item.buy.max) {
          console.log('zero buy:', item)
        }
        if (!item.sell.min) {
          console.log('zero sell:', item)
        }
      })

      const prices = { sell, buy }
      this.setState({ prices })
    })

    this.makeLowerCaseNames()
  }

  makeSingleRun() {
    forEach(reactions, item => {
      item.quantity = item.quantity / 100
      item.inputs.forEach(input => input.quantity = input.quantity / 100)
    })
  }

  makeHundredRuns() {
    forEach(reactions, item => {
      item.quantity = item.quantity * 100
      item.inputs.forEach(input => input.quantity = input.quantity * 100)
    })
  }

  makeLowerCaseNames() {
    forEach(reactions, item => {
      item.lcName = item.name.toLowerCase()
      item.inputs.forEach(input => input.lcName = input.name.toLowerCase())
    })
  }

  toggleEfficiency = () => {
    this.setState({ efficiency: !this.state.efficiency })
  }

  handleFilter = filterValue => {
    this.setState({ filterValue })
  }

  toggleRuns = () => {
    const { hundredRuns } = this.state
    this.setState({ hundredRuns: !hundredRuns })
    hundredRuns ? this.makeSingleRun() : this.makeHundredRuns()
  }

  render() {
    const { list_type, refinery_type, efficiency, filterValue, hundredRuns } = this.state
    const effStr = efficiency ? '2.2% ME' : '0% ME'
    return (
      <div className='sheet-root'>
        <div className='row'>
          <FilterPanel
            isOpened={this.props.filterOpened}
            onFilter={this.handleFilter}
          />
          <div className='col-md-4 t-a_l col-first'>
            <Panel bsClass="control-panel">
              <ToggleButtonGroup bsSize='small' type='radio' bsStyle='primary' name='list_type' defaultValue='full'>
                <ToggleButton bsStyle='primary' value='full' onClick={() => this.setState({ list_type: 'full' })}>{'Full'}</ToggleButton>
                <ToggleButton bsStyle='primary' value='short' onClick={() => this.setState({ list_type: 'short' })}>{'Short'}</ToggleButton>
              </ToggleButtonGroup>
              <ToggleButtonGroup bsSize='small' type='radio' bsStyle='primary' name='refinery_type' defaultValue='athanor'>
                <ToggleButton value='athanor' onClick={() => this.setState({ refinery_type: 'athanor' })}>{'Athanor'}</ToggleButton>
                <ToggleButton value='tatara' onClick={() => this.setState({ refinery_type: 'tatara' })}>{'Tatara'}</ToggleButton>
              </ToggleButtonGroup>
              <Button
                bsSize='small'
                onClick={this.toggleEfficiency}
                style={{ width: 72 }}
              >
                {effStr}
              </Button>
              <Button
                bsSize='small'
                onClick={this.toggleRuns}
                style={{ width: 56, paddingLeft: 3, paddingRight: 3 }}
              >
                {hundredRuns ? '100 runs' : '1 run'}
              </Button>
            </Panel>
          </div>
          <div className='col-md-8 t-a_l col-last'>
            <SheetItems
              reactions={reactions}
              prices={this.state.prices}
              price_input_type='sell'
              price_output_type='sell'
              list_type={list_type}
              refinery_type={refinery_type}
              efficiency={efficiency}
              filter={filterValue}
            />
          </div>
        </div>
      </div>
    )
  }
}

export default MoonSheet