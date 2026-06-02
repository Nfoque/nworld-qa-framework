# Testing Automation, What are Pyramids and Diamonds?

[

![Ritesh Kapoor](Testing%20Automation,%20What%20are%20Pyramids%20and%20Diamonds%20%20by%20Ritesh%20Kapoor%20%20Medium/1MvgIAR2052p2eSxiPGGBhw.jpeg)





](https://ritesh-kapoor.medium.com/?source=post_page---byline--67494fec7c55---------------------------------------)

[Ritesh Kapoor](https://ritesh-kapoor.medium.com/?source=post_page---byline--67494fec7c55---------------------------------------)

Follow

4 min read

·

Jan 1, 2022

18

1

Listen

Share

More

Press enter or click to view image in full size

![](Testing%20Automation,%20What%20are%20Pyramids%20and%20Diamonds%20%20by%20Ritesh%20Kapoor%20%20Medium/1j3f7nO44rWrPRyFS7mLsEw.jpeg)

Photo by [Eugene Tkachenko](https://unsplash.com/@eugene_tkachenko?utm_source=medium&utm_medium=referral) on [Unsplash](https://unsplash.com/?utm_source=medium&utm_medium=referral)

Testing pyramids (which are also referred to as Test Automation pyramids) is a framework that lays out the different types of tests that should be included in automated test suites. Producing high-quality software and reducing the time required to identify breaking change is not a trivial task. The testing strategy is a very important factor in deciding the agility of your team and project.

## Why Testing Pyramids are important?

-   **Quality of the product:** A product free of defects and issues.
-   **The velocity of the team:** How fast a feature could be delivered.
-   **Release predictability**: The ability to plan and deliver with predictability.

## What are different Types of Pyramids?

### Testing Pyramid

![](Testing%20Automation,%20What%20are%20Pyramids%20and%20Diamonds%20%20by%20Ritesh%20Kapoor%20%20Medium/1F26nbm1Nk-5HB1_GtDYc4Q.png)

You might have probably seen the test automation pyramid something like above by now. Mike Cohn came up with this concept in his book _Succeeding with Agile_. It tells us about different testing layers and how much testing is required to be done on each layer. The different Layers are:

## Why Testing Pyramids are important?

2.  **Manual Testing:** We should have a test suite strong enough to avoid any manual testing which is required as a prerequisite before taking it to production. But in the practical world, there are times where we cannot completely avoid manual testing due to time or delivery constraints. We should introduce tests as early as possible to maintain hygiene. If it is practice, then it highlights something is wrong with how we are testing.
3.  **End To End Testing:** Automated tests, which are responsible for testing applications workflow from beginning to end for the entire software. They focus on testing user stories or an end to end functionality that simulates real-world scenarios. In a microservices architecture, it can span across different services to test a functionality End To End.
4.  **Integration Testing:** It takes different software modules that are integrated logically and test them as a group. In microservices architecture. It can also refer to testing service in isolation.
5.  **Unit Testing:** Unit tests take a small piece of the product and test that piece in isolation.

### Inverted Test Pyramid

![](Testing%20Automation,%20What%20are%20Pyramids%20and%20Diamonds%20%20by%20Ritesh%20Kapoor%20%20Medium/15n5fMwgwCJQY8oqAyiy_1g.png)

The Inverted test pyramid which is also referred to as Ice cream cone pyramid is another strategy in which a lot of focus is made towards Manual/E2E Testing and is least concerned about Unit Testing. The cost of testing is too high and are extremely painful and inefficient. It impacts agility and is sometimes considered as an Anti Pattern that should be avoided.

But, it works well when you are developing application prototypes or working on Proof of Concept, where the focus is more on developing a functionality rather than investing time in maintaining Test Suite. Prototypes eventually phase out to stable products.

### Diamond

![](Testing%20Automation,%20What%20are%20Pyramids%20and%20Diamonds%20%20by%20Ritesh%20Kapoor%20%20Medium/13EHuHJVj31kk0oBaM4xg5A.png)

We all know that writing and maintaining a test suite is not cheap. Like source code, it should be carefully written and maintained. In the microservice world, practically speaking Integration Tests could hold more value than Unit tests. Testing how an application behaves when it interacts with other services provides more confidence and reliability on the test suite. Integration test does not mean to test application using actual service, rather mocks should represent external service so that tests run in isolation.

End to End Tests is still hard to develop and maintain and should be avoided.

## How to apply them in projects?

Press enter or click to view image in full size

![](Testing%20Automation,%20What%20are%20Pyramids%20and%20Diamonds%20%20by%20Ritesh%20Kapoor%20%20Medium/17zRw3ulqJ6PfxFsWvCVMdQ.png)

## Comparison on different Metrics

![](Testing%20Automation,%20What%20are%20Pyramids%20and%20Diamonds%20%20by%20Ritesh%20Kapoor%20%20Medium/1nIiVSvvOv95JCKx9G3mfBQ.png)

## Final Thoughts

The true value of the test strategy is to let the developer know that there is some problem with code changes, the issue lies in what area and how fast we can get to know about the problem. There is no right or wrong strategy, It’s all about what works for you.

Please share your thoughts and experiences.

## References

-   [https://www.linkedin.com/pulse/inverting-test-pyramid-joel-masset/](https://www.linkedin.com/pulse/inverting-test-pyramid-joel-masset/)
-   [https://martinfowler.com/bliki/TestPyramid.html](https://martinfowler.com/bliki/TestPyramid.html)
-   [https://martinfowler.com/articles/practical-test-pyramid.html](https://martinfowler.com/articles/practical-test-pyramid.html)
-   [https://eason.blog/posts/2020/03/test-automation-diamond/](https://eason.blog/posts/2020/03/test-automation-diamond/)
-   [https://testing.googleblog.com/2015/04/just-say-no-to-more-end-to-end-tests.html](https://testing.googleblog.com/2015/04/just-say-no-to-more-end-to-end-tests.html)
-   [https://engineering.atspotify.com/2018/01/11/testing-of-microservices/](https://engineering.atspotify.com/2018/01/11/testing-of-microservices/)