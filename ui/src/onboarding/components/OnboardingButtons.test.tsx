// Libraries
import React from 'react'
import {mount} from 'enzyme'

// Components
import OnboardingButtons from 'src/onboarding/components/OnboardingButtons'
import {ButtonType} from '@influxdata/clockface'

const setup = (override = {}) => {
  const props = {
    onClickBack: jest.fn(),
    nextButtonText: 'next',
    backButtonText: 'back',
    ...override,
  }

  const wrapper = mount(<OnboardingButtons {...props} />)

  return {wrapper}
}

describe('Onboarding.Components.OnboardingButtons', () => {
  describe('rendering', () => {
    it('renders next and back buttons with the correct text', () => {
      const nextButtonText = 'Continue'
      const backButtonText = 'Previous'
      const onClickBack = jest.fn()

      const {wrapper} = setup({
        nextButtonText,
        backButtonText,
        onClickBack,
      })

      const nextButton = wrapper.find('[data-testid="next"]')
      const backButton = wrapper.find('[data-testid="back"]')

      backButton.simulate('click')

      expect(wrapper.exists()).toBe(true)
      expect(nextButton.prop('text')).toBe(nextButtonText)
      expect(nextButton.prop('type')).toBe(ButtonType.Submit)
      expect(backButton.prop('text')).toBe(backButtonText)
      expect(backButton.prop('type')).toBe(ButtonType.Button)
      expect(onClickBack).toBeCalled()
    })

    describe('if show skip', () => {
      it('renders the skip button', () => {
        const onClickSkip = jest.fn()
        const {wrapper} = setup({
          showSkip: true,
          onClickSkip,
        })

        const skipButton = wrapper.find('[data-testid="skip"]')
        skipButton.simulate('click')

        expect(skipButton.exists()).toBe(true)
        expect(skipButton.prop('type')).toBe(ButtonType.Button)
        expect(onClickSkip).toBeCalled()
      })
    })
  })
})
