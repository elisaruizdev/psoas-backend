import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { Physios } from '../physios/entities/physios.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Diagnosis } from '../diagnoses/entities/diagnosis.entity';
import { Treatment } from '../treatments/entities/treatment.entity';
import { Session } from '../sessions/entities/session.entity';
import { Appointment } from '../appointment/entities/appointment.entity';

export const DEMO_EMAIL = 'demo@psoas.dev';
export const DEMO_PASSWORD = 'Demo1234!';

// Fecha relativa a hoy, para que el dashboard siempre tenga datos
function daysFromNow(days: number, hour = 9, minute = 0): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, minute, 0, 0);
  return date;
}

export async function seedDemoData(dataSource: DataSource): Promise<void> {
  const physiosRepository = dataSource.getRepository(Physios);

  const existing = await physiosRepository.findOne({
    where: { email: DEMO_EMAIL },
  });
  if (existing) {
    return;
  }

  const password = await bcrypt.hash(DEMO_PASSWORD, 10);

  const [demo, colleague] = await physiosRepository.save([
    physiosRepository.create({
      name: 'Laura',
      surname: 'Martín',
      second_surname: 'Gómez',
      phone: '600111222',
      email: DEMO_EMAIL,
      city: 'Madrid',
      specialty: 'Fisioterapia deportiva',
      license_number: 'COL-28-4512',
      password,
      is_verified: true,
      status: 'active',
    }),
    physiosRepository.create({
      name: 'Javier',
      surname: 'Ortega',
      phone: '600333444',
      email: 'javier@psoas.dev',
      city: 'Madrid',
      specialty: 'Fisioterapia neurológica',
      license_number: 'COL-28-7820',
      password,
      is_verified: true,
      status: 'active',
    }),
  ]);

  // Solicitud pendiente, para enseñar el flujo de aprobar o rechazar
  await physiosRepository.save(
    physiosRepository.create({
      name: 'Marta',
      surname: 'Ruiz',
      phone: '600555666',
      email: 'marta@psoas.dev',
      password,
      is_verified: false,
      status: 'pending_verification',
    }),
  );

  const patientsRepository = dataSource.getRepository(Patient);
  const [ana, carlos, lucia, pedro] = await patientsRepository.save([
    patientsRepository.create({
      name: 'Ana',
      surname: 'López',
      second_surname: 'Serrano',
      phone: '611000001',
      email: 'ana.lopez@example.com',
      city: 'Madrid',
      zip: '28015',
      identifier: '12345678A',
      birthdate: new Date('1988-04-12'),
      gender: 'femenino',
      consultation_reason: 'Dolor lumbar al estar sentada mucho tiempo',
      health_insurance: 'Sanitas',
      emergency_contact: 'Luis López - 611000101',
    }),
    patientsRepository.create({
      name: 'Carlos',
      surname: 'Fernández',
      phone: '611000002',
      email: 'carlos.fernandez@example.com',
      city: 'Madrid',
      zip: '28039',
      identifier: '23456789B',
      birthdate: new Date('1995-09-30'),
      gender: 'masculino',
      consultation_reason: 'Esguince de tobillo jugando al fútbol',
      health_insurance: 'Adeslas',
    }),
    patientsRepository.create({
      name: 'Lucía',
      surname: 'Navarro',
      phone: '611000003',
      email: 'lucia.navarro@example.com',
      city: 'Alcobendas',
      identifier: '34567890C',
      birthdate: new Date('1976-01-22'),
      gender: 'femenino',
      consultation_reason: 'Rehabilitación tras prótesis de rodilla',
    }),
    patientsRepository.create({
      name: 'Pedro',
      surname: 'Sánchez',
      phone: '611000004',
      email: 'pedro.sanchez@example.com',
      city: 'Getafe',
      identifier: '45678901D',
      birthdate: new Date('1962-11-05'),
      gender: 'masculino',
      consultation_reason: 'Cervicalgia crónica',
    }),
  ]);

  const diagnosesRepository = dataSource.getRepository(Diagnosis);
  await diagnosesRepository.save([
    diagnosesRepository.create({
      patient_id: ana.id,
      diagnosis_date: daysFromNow(-40),
      diagnosis_type: 'Lumbalgia mecánica',
      description: 'Dolor en zona L4-L5 sin irradiación.',
      observations: 'Trabaja muchas horas frente al ordenador.',
    }),
    diagnosesRepository.create({
      patient_id: carlos.id,
      diagnosis_date: daysFromNow(-20),
      diagnosis_type: 'Esguince de tobillo grado II',
      description: 'Lesión del ligamento peroneoastragalino anterior.',
    }),
    diagnosesRepository.create({
      patient_id: lucia.id,
      diagnosis_date: daysFromNow(-60),
      diagnosis_type: 'Artroplastia total de rodilla derecha',
      description: 'Postoperatorio de prótesis de rodilla.',
    }),
    diagnosesRepository.create({
      patient_id: pedro.id,
      diagnosis_date: daysFromNow(-200),
      diagnosis_type: 'Contractura de trapecio',
      description: 'Episodio agudo ya resuelto.',
      status: 'resolved',
    }),
  ]);

  const treatmentsRepository = dataSource.getRepository(Treatment);
  const [anaTreatment, carlosTreatment, luciaTreatment] =
    await treatmentsRepository.save([
      treatmentsRepository.create({
        patient_id: ana.id,
        treatment_name: 'Estabilización lumbar',
        start_date: daysFromNow(-35),
        description: 'Terapia manual y ejercicio terapéutico de core.',
        objectives: 'Reducir el dolor y mejorar la higiene postural.',
        sessions_planned: 10,
      }),
      treatmentsRepository.create({
        patient_id: carlos.id,
        treatment_name: 'Readaptación de tobillo',
        start_date: daysFromNow(-18),
        description: 'Trabajo propioceptivo y de fuerza progresiva.',
        objectives: 'Volver a jugar sin dolor en 6 semanas.',
        sessions_planned: 8,
      }),
      treatmentsRepository.create({
        patient_id: lucia.id,
        treatment_name: 'Rehabilitación postquirúrgica de rodilla',
        start_date: daysFromNow(-55),
        description: 'Ganancia de rango articular y fortalecimiento.',
        objectives: 'Llegar a 110º de flexión y caminar sin bastón.',
        sessions_planned: 20,
        status: 'paused',
      }),
    ]);

  const sessionsRepository = dataSource.getRepository(Session);
  await sessionsRepository.save([
    sessionsRepository.create({
      patient_id: ana.id,
      treatment_id: anaTreatment.id,
      physio_id: demo.id_physio,
      session_date: daysFromNow(-14),
      duration: 60,
      techniques_applied: 'Movilización lumbar, masaje miofascial.',
      patient_evolution: 'Refiere menos dolor por las mañanas.',
    }),
    sessionsRepository.create({
      patient_id: ana.id,
      treatment_id: anaTreatment.id,
      physio_id: demo.id_physio,
      session_date: daysFromNow(-7),
      duration: 60,
      techniques_applied: 'Ejercicios de core y estiramientos.',
      patient_evolution: 'Buena tolerancia al ejercicio.',
      observations: 'Pautados ejercicios para casa.',
    }),
    sessionsRepository.create({
      patient_id: carlos.id,
      treatment_id: carlosTreatment.id,
      physio_id: colleague.id_physio,
      session_date: daysFromNow(-5),
      duration: 45,
      techniques_applied: 'Vendaje funcional y propiocepción.',
      patient_evolution: 'Ya apoya sin dolor.',
    }),
    sessionsRepository.create({
      patient_id: lucia.id,
      treatment_id: luciaTreatment.id,
      physio_id: demo.id_physio,
      session_date: daysFromNow(-10),
      duration: 60,
      techniques_applied: 'Movilización pasiva y electroestimulación.',
      patient_evolution: 'Flexión de rodilla en 95º.',
    }),
  ]);

  const appointmentsRepository = dataSource.getRepository(Appointment);
  await appointmentsRepository.save([
    appointmentsRepository.create({
      patient_id: ana.id,
      physio_id: demo.id_physio,
      appointment_date: daysFromNow(0, 9),
      session_number: 3,
      status: 'completed',
    }),
    appointmentsRepository.create({
      patient_id: carlos.id,
      physio_id: colleague.id_physio,
      appointment_date: daysFromNow(0, 11, 30),
      duration: 45,
      session_number: 2,
    }),
    appointmentsRepository.create({
      patient_id: lucia.id,
      physio_id: demo.id_physio,
      appointment_date: daysFromNow(0, 17),
      session_number: 6,
      notes: 'Traer informe del traumatólogo.',
    }),
    appointmentsRepository.create({
      patient_id: ana.id,
      physio_id: demo.id_physio,
      appointment_date: daysFromNow(2, 10),
      session_number: 4,
    }),
    appointmentsRepository.create({
      patient_id: pedro.id,
      physio_id: colleague.id_physio,
      appointment_date: daysFromNow(4, 16),
      session_number: 1,
      notes: 'Primera visita.',
    }),
  ]);

  console.log(`Datos demo creados. Usuario: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
}
