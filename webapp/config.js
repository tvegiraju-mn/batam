module.exports = {
    screenshotsLocation: './screenshots',
    /**
        manualTestcasesScreenshotsLocation is the location of the screeshots that are obtained from ZIRA, through rest calls to BATAM.
        When a report is downloaded, the screenshots obtained from RTS, and manual will be merged. Hence the values of the screenshotsLocation and
        manualTestcasesScreenshotsLocation MUST always be different.
    */
    manualTestcasesScreenshotsLocation : 'D:\\Screenshots',
    screenshotUrl: 'http://screenshots_server_host_name:9999/screenshots?buildId=',
    database: {
        URL: 'mongodb://@localhost:27017/batam' 
    },
    reports: {
        report: {
            display: {
                summary: {
                    name: true,
                    description: true,
                    start_date: true,
                    end_date: true,
                    status: true,
                    duration: true,
                    total: true,
                    passes: true,
                    failures: true,
                    errors: true,
                    columns: {
                        order: true,
                        name: true,
                        status: true,
                        duration: true
                    }
                },
                test: {
                    moduleName: true,
                    authoredBy: true,
                    name: true,
                    dateCreated: true,
                    description: true,
                    approvalStatus: true,
                    prerequisites: true,
                    approvedBy: true,
                    executed_by: true,
                    approval_date: true,
                    start_date: true,
                    signature: true,
                    end_date: true,
                    numberOfAttachments: true,
                    duration: true,
                    comments: true,
                    status: true,
                    tags: true,
                    log: true,
                    steps: {
                        order: true,
                        name: true,
                        input: true,
                        expected: true,
                        status: true,
                        output: true,
                        duration: true,
                        error: true,
                        screenshot: true,
                        attachment: true,
                        executionDateAndTime: true,
                        attachmentUploadedBy: true,
                        attachmentUploadedDate: true,
                    }
                }

            }
        }
    }
}