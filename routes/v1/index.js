const router=require('express').Router()
const middleware = require('../../service/middleware').middleware
const adminController=require('../../controller/adminController')
const teacherController = require('../../controller/teacherController')
const studentController = require('../../controller/studentController')

router.post('/adminreg',adminController.adminReg)
router.post('/adminlogin',adminController.adminlogin)


router.post('/teacherreg',teacherController.teacherReg)
router.post('/teacherlogin',teacherController.teacherlogin)

router.post('/studentreg',studentController.studentReg)
router.post('/studentlogin',studentController.studentlogin)
router.get('/viewcourse',studentController.viewCourse)

router.use(middleware)

router.get('/viewstudents',adminController.viewStudents)
router.post('/addcoursebyadmin',adminController.addCourseByAdmin)



router.post('/addcoursebyteacher',teacherController.addCourseByTeacher)
router.get('/viewreqbyteacher',teacherController.viewReqByTeacher)
router.post('/acceptreq',teacherController.acceptReq)
router.post('/rejectreq/:id',teacherController.rejectReq)
router.get('/viewenrolledstudbyteacher',teacherController.viewEnrolledStudByTeacher)
router.get('/view',teacherController.view)



router.post('/enrollcourse',studentController.enrollCourse)

module.exports = router